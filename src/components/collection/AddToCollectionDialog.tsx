import React, { useState, useEffect } from 'react';
import { FolderPlus, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LocalCollection, localCollectionService } from '@/lib/services/local-collections.service';
import { useToast } from '@/hooks/use-toast';

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  onSuccess?: () => void;
}

const AddToCollectionDialog: React.FC<AddToCollectionDialogProps> = ({
  open,
  onOpenChange,
  threadId,
  onSuccess,
}) => {
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await localCollectionService.getUserCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: 'Error',
        description: 'Collection name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      
      // First create the collection
      const newCollection = await localCollectionService.createCollection(newCollectionName, isPrivate);
      console.log('Collection created:', newCollection);
      
      // Then add the thread to the collection
      if (newCollection && newCollection.id) {
        try {
          await localCollectionService.addThreadToCollection(newCollection.id, threadId);
          console.log('Thread added to collection:', threadId, 'to collection:', newCollection.id);
          
          toast({
            title: 'Success',
            description: 'Thread added to new collection',
          });
          
          if (onSuccess) onSuccess();
        } catch (addError) {
          console.error('Error adding thread to collection:', addError);
          toast({
            title: 'Partial Success',
            description: 'Collection created but failed to add thread',
            variant: 'destructive',
          });
        }
      }
      
      setNewCollectionName('');
      setIsPrivate(true);
      setShowCreateForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    try {
      console.log('Adding thread to collection:', threadId, 'to collection:', collectionId);
      await localCollectionService.addThreadToCollection(collectionId, threadId);
      console.log('Thread added to collection successfully');
      
      toast({
        title: 'Success',
        description: 'Thread added to collection',
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to add thread to collection: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Add this thread to one of your collections or create a new one.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center">
            <p>Loading collections...</p>
          </div>
        ) : (
          <div className="py-4">
            {showCreateForm ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Career Wisdom, Writing Fuel"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="private">Private Collection</Label>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={creating}>
                    {creating ? 'Creating...' : 'Create & Add'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {collections.length === 0 ? (
                  <div className="text-center py-6">
                    <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No collections yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create your first collection to organize your favorite threads.
                    </p>
                    <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                      Create Collection
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2 mb-4">
                      {collections.map((collection) => (
                        <div
                          key={collection.id}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => handleAddToCollection(collection.id)}
                        >
                          <div>
                            <h4 className="font-medium">{collection.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {collection.is_private ? 'Private' : 'Public'}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Collection
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;

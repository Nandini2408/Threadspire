import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FolderPlus, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LocalCollection, localCollectionService } from '@/lib/services/local-collections.service';
import { useAuth } from '@/hooks/useAuth';

const CollectionManager: React.FC = () => {
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [editCollection, setEditCollection] = useState<LocalCollection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadCollections();
    }
  }, [isAuthenticated]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      console.log('Loading user collections...');
      const data = await localCollectionService.getUserCollections();
      console.log('Collections loaded successfully:', data.length, 'collections');
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collections: ' + (error instanceof Error ? error.message : 'Unknown error'),
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
      console.log('Creating collection:', newCollectionName, 'private:', isPrivate);
      const collection = await localCollectionService.createCollection(newCollectionName, isPrivate);
      console.log('Collection created successfully:', collection);
      
      toast({
        title: 'Success',
        description: 'Collection created successfully',
      });
      setNewCollectionName('');
      setIsPrivate(true);
      setIsDialogOpen(false);
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to create collection: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCollection = async () => {
    if (!editCollection) return;
    if (!editCollection.name.trim()) {
      toast({
        title: 'Error',
        description: 'Collection name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      await localCollectionService.updateCollection(editCollection.id, {
        name: editCollection.name,
        is_private: editCollection.is_private,
      });
      toast({
        title: 'Success',
        description: 'Collection updated successfully',
      });
      setEditCollection(null);
      setIsDialogOpen(false);
      loadCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to update collection',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      await localCollectionService.deleteCollection(id);
      toast({
        title: 'Success',
        description: 'Collection deleted successfully',
      });
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (collection: LocalCollection) => {
    setEditCollection(collection);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditCollection(null);
    setNewCollectionName('');
    setIsPrivate(true);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Collections</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-10">
          <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No collections yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first collection to organize your favorite threads.
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{collection.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(collection)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center text-xs">
                  {collection.is_private ? (
                    <>
                      <Lock className="mr-1 h-3 w-3" /> Private
                    </>
                  ) : (
                    <>
                      <Unlock className="mr-1 h-3 w-3" /> Public
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/collections/${collection.id}`)}
                >
                  View Collection
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCollection ? 'Edit Collection' : 'Create New Collection'}
            </DialogTitle>
            <DialogDescription>
              {editCollection
                ? 'Update your collection details.'
                : 'Create a new collection to organize your favorite threads.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={editCollection ? editCollection.name : newCollectionName}
                onChange={(e) =>
                  editCollection
                    ? setEditCollection({
                        ...editCollection,
                        name: e.target.value,
                      })
                    : setNewCollectionName(e.target.value)
                }
                placeholder="e.g., Career Wisdom, Writing Fuel"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={editCollection ? editCollection.is_private : isPrivate}
                onCheckedChange={(checked) =>
                  editCollection
                    ? setEditCollection({
                        ...editCollection,
                        is_private: checked,
                      })
                    : setIsPrivate(checked)
                }
              />
              <Label htmlFor="private">Private Collection</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={editCollection ? handleUpdateCollection : handleCreateCollection}
            >
              {editCollection ? 'Save Changes' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionManager;

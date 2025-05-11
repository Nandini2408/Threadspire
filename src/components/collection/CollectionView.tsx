import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThreadCard from '@/components/discovery/ThreadCard';
import { localCollectionService, LocalCollectionWithThreads } from '@/lib/services/local-collections.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const CollectionView: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [collection, setCollection] = useState<LocalCollectionWithThreads | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && collectionId) {
      loadCollection(collectionId);
    }
  }, [collectionId, isAuthenticated]);

  const loadCollection = async (collectionId: string) => {
    try {
      setLoading(true);
      const data = await localCollectionService.getCollection(collectionId);
      setCollection(data);
    } catch (error) {
      console.error('Error loading collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveThread = async (threadId: string) => {
    if (!collection || !collectionId) return;
    if (!confirm('Remove this thread from the collection?')) return;

    try {
      await localCollectionService.removeThreadFromCollection(collectionId, threadId);
      toast({
        title: 'Success',
        description: 'Thread removed from collection',
      });
      loadCollection(collectionId);
    } catch (error) {
      console.error('Error removing thread:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove thread',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild>
            <Link to="/library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Link>
          </Button>
        </div>
        <div className="text-center py-10">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Collection not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            The collection you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/library">Return to Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild>
          <Link to="/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            {collection.is_private ? (
              <>
                <Lock className="mr-1 h-4 w-4" /> Private
              </>
            ) : (
              <>
                <Unlock className="mr-1 h-4 w-4" /> Public
              </>
            )}
          </div>
        </div>
      </div>

      {collection.threads.length === 0 ? (
        <div className="text-center py-10">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No threads in this collection</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Bookmark threads and add them to this collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.threads.map((thread) => {
            // Adapt ThreadWithSegments to match Thread interface expected by ThreadCard
            const adaptedThread = {
              ...thread,
              // Add missing properties with default values
              snippet: thread.segments?.[0]?.content || '',
              publishedAt: new Date(thread.created_at || Date.now()),
              readingTime: 3, // Default reading time in minutes
              bookmarks: 0,   // Default bookmarks count
              reactions: 0,   // Default reactions count
              // Ensure tags exists
              tags: thread.tags || [],
              // Create a proper author object regardless of the input format
              author: {
                id: undefined, // We don't need the id for display purposes
                name: typeof thread.author === 'object' ? (thread.author.name || 'Unknown') : 'Unknown',
                avatarUrl: typeof thread.author === 'object' && thread.author.avatar ? thread.author.avatar : ''
              }
            };
            
            return (
              <ThreadCard
                key={thread.id}
                thread={adaptedThread}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveThread(thread.id)}
                  >
                    Remove from collection
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollectionView;

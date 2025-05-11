
import React, { useState, useEffect } from 'react';
import ThreadCard from './ThreadCard';
import { Skeleton } from '@/components/ui/skeleton';
import { threadService } from '@/lib/services/thread.service';

interface RelatedThreadsProps {
  threadId: string;
  tags: string[];
}

const RelatedThreads = ({ threadId, tags }: RelatedThreadsProps) => {
  const [relatedThreads, setRelatedThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTags, setCurrentTags] = useState<string[]>(tags);

  useEffect(() => {
    const loadThreadData = async () => {
      if (!threadId) return;
      
      try {
        const threadData = await threadService.getThreadById(threadId);
        if (threadData.tags && threadData.tags.length > 0) {
          setCurrentTags(threadData.tags);
        }
      } catch (error) {
        console.error('Error loading thread data:', error);
      }
    };
    
    if (tags.length === 0) {
      loadThreadData();
    }
  }, [threadId, tags]);

  useEffect(() => {
    const loadRelatedThreads = async () => {
      if (!currentTags || currentTags.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Get all published threads
        const { threads } = await threadService.getThreads({
          onlyPublished: true,
          limit: 20 // Get more threads to filter from
        });

        // Filter threads that have at least one matching tag with the current thread
        const threadsWithMatchingTags = threads.filter(thread => {
          // Skip the current thread
          if (thread.id === threadId) return false;
          
          // Check if this thread has any tags that match the current thread's tags
          return thread.tags.some(tag => currentTags.includes(tag));
        });
        
        // Sort by number of matching tags (most matches first)
        const sortedThreads = threadsWithMatchingTags.sort((a, b) => {
          const aMatchCount = a.tags.filter(tag => currentTags.includes(tag)).length;
          const bMatchCount = b.tags.filter(tag => currentTags.includes(tag)).length;
          return bMatchCount - aMatchCount;
        });
        
        setRelatedThreads(sortedThreads.slice(0, 3)); // Take at most 3 related threads
      } catch (error) {
        console.error('Error loading related threads:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedThreads();
  }, [threadId, currentTags]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (relatedThreads.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No related threads found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {relatedThreads.map(thread => {
        // Calculate total reactions
        const reactionTotal = Object.values(thread.reaction_counts || {}).reduce(
          (a: number, b: number) => a + b, 
          0
        );
        
        return (
          <ThreadCard
            key={thread.id}
            thread={{
              id: thread.id,
              title: thread.title,
              snippet: thread.snippet || (thread.segments[0]?.content.substring(0, 120) + '...'),
              coverImage: thread.cover_image,
              author: {
                name: 'Author',
                avatarUrl: '/placeholder-avatar.jpg',
              },
              publishedAt: new Date(thread.created_at),
              readingTime: thread.segments.length,
              bookmarks: 0,
              reactions: reactionTotal as number,
              tags: thread.tags,
            }}
          />
        );
      })}
    </div>
  );
};

export default RelatedThreads;

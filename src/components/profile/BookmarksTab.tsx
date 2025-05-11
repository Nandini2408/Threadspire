import React, { useState, useEffect } from 'react';
import ThreadCard from '@/components/discovery/ThreadCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookmarkIcon } from 'lucide-react';

interface BookmarksTabProps {
  userId: string;
  isOwnProfile: boolean;
}

const BookmarksTab = ({ userId, isOwnProfile }: BookmarksTabProps) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!isOwnProfile) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('bookmarks')
          .select('thread:threads(*, thread_segments(*), thread_tags(tag:tags(*)))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) {
          setError('Failed to load bookmarks. Please try again later.');
          setBookmarks([]);
        } else {
          setBookmarks((data || []).map((row: any) => row.thread));
        }
      } catch (err) {
        setError('Failed to load bookmarks. Please try again later.');
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [isOwnProfile, userId]);

  const formatThreadForCard = (thread: any) => {
    return {
      id: thread.id,
      title: thread.title,
      snippet: thread.snippet || (thread.thread_segments?.[0]?.content?.substring(0, 120) + '...'),
      coverImage: thread.cover_image,
      author: {
        id: thread.user_id,
        name: 'Author',
        avatarUrl: '/placeholder-avatar.jpg',
      },
      publishedAt: new Date(thread.created_at),
      readingTime: thread.thread_segments?.length || 1,
      bookmarks: 0,
      reactions: 0,
      tags: thread.thread_tags?.map((t: any) => t.tag.name) || [],
    };
  };

  if (!isOwnProfile) {
    return (
      <div className="text-center py-16">
        <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
        <p className="text-muted-foreground">Bookmarks are private to each user.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16">
        <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
        <p className="text-muted-foreground">No bookmarks yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {bookmarks.map(thread => (
        <ThreadCard key={thread.id} thread={formatThreadForCard(thread)} />
      ))}
    </div>
  );
};

export default BookmarksTab;

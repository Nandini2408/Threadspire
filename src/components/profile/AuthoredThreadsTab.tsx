import React, { useEffect, useState } from 'react';
import ThreadCard from '@/components/discovery/ThreadCard';
import { supabase } from '@/integrations/supabase/client';

interface AuthoredThreadsTabProps {
  userId: string;
}

const AuthoredThreadsTab = ({ userId }: AuthoredThreadsTabProps) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('threads')
        .select('*, thread_segments(*), thread_tags(tag:tags(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        setError('Failed to load threads.');
        setThreads([]);
      } else {
        setThreads(data || []);
      }
      setLoading(false);
    };
    fetchThreads();
  }, [userId]);

  const formatThreadForCard = (thread: any) => {
    return {
      id: thread.id,
      title: thread.title,
      snippet: thread.snippet || (thread.thread_segments?.[0]?.content?.substring(0, 120) + '...'),
      coverImage: thread.cover_image,
      author: {
        id: thread.user_id,
        name: 'You',
        avatarUrl: '/placeholder-avatar.jpg',
      },
      publishedAt: new Date(thread.created_at),
      readingTime: thread.thread_segments?.length || 1,
      bookmarks: 0,
      reactions: 0,
      tags: thread.thread_tags?.map((t: any) => t.tag.name) || [],
    };
  };

  if (loading) {
    return <div className="text-center py-16">Loading threads...</div>;
  }
  if (error) {
    return <div className="text-center py-16 text-destructive">{error}</div>;
  }
  if (threads.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No threads created yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {threads.map(thread => (
        <ThreadCard key={thread.id} thread={formatThreadForCard(thread)} />
      ))}
    </div>
  );
};

export default AuthoredThreadsTab;

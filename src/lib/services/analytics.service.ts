import { supabase } from '../supabase';

export const analyticsService = {
  // Log thread view
  async logThreadView(threadId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert interaction log
      const { error } = await supabase
        .from('interaction_logs')
        .insert({
          user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Anonymous ID for non-logged users
          thread_id: threadId,
          interaction_type: 'VIEW'
        });
      
      if (error) throw error;
      
      // Update view count
      const { error: analyticsError } = await supabase.rpc('increment_view_count', {
        thread_id: threadId
      });
      
      if (analyticsError) {
        console.error('Failed to update view count:', analyticsError);
      }
      
      return true;
    } catch (e) {
      console.error('Error logging thread view:', e);
      return false;
    }
  },
  
  // Get trending threads based on recent views
  async getTrendingThreads(limit = 5): Promise<any[]> {
    try {
      // Get threads with most views in the last 7 days
      const { data, error } = await supabase
        .from('interaction_logs')
        .select('thread_id, count(*)')
        .eq('interaction_type', 'VIEW')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .group('thread_id')
        .order('count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get the actual thread data
      const threadIds = data.map((item: any) => item.thread_id);
      
      const { data: threads, error: threadsError } = await supabase
        .from('threads')
        .select(`
          *,
          user_id,
          segments:thread_segments(*),
          tags:thread_tags(tag:tags(name)),
          user:user_id(name, avatar_url)
        `)
        .in('id', threadIds)
        .eq('is_published', true);
      
      if (threadsError) throw threadsError;
      
      if (!threads) {
        return [];
      }
      
      // Format the threads data
      return threads.map((thread: any) => ({
        ...thread,
        tags: thread.tags.map((t: any) => t.tag.name),
        author: {
          id: thread.user_id,
          name: thread.user?.name || 'Unknown Creator',
          avatarUrl: thread.user?.avatar_url || '/placeholder-avatar.jpg'
        }
      }));
    } catch (e) {
      console.error('Error getting trending threads:', e);
      return [];
    }
  },
  
  // Get thread analytics
  async getThreadAnalytics(threadId: string) {
    try {
      // Get thread view count
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('thread_analytics')
        .select('view_count, unique_viewers')
        .eq('thread_id', threadId)
        .single();
      
      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }
      
      // If no analytics record exists yet, return default values
      if (!analyticsData) {
        return {
          view_count: 0,
          unique_viewers: 0
        };
      }
      
      return analyticsData;
    } catch (e) {
      console.error('Error getting thread analytics:', e);
      return {
        view_count: 0,
        unique_viewers: 0
      };
    }
  },
  
  // Get daily view counts for a thread
  async getThreadViewsByDay(threadId: string, days = 30) {
    try {
      const { data, error } = await supabase
        .from('interaction_logs')
        .select('created_at')
        .eq('thread_id', threadId)
        .eq('interaction_type', 'VIEW')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
        
      if (error) throw error;
      
      if (!data) {
        return [];
      }
      
      // Process data to get counts by day
      const countsByDay: Record<string, number> = {};
      const today = new Date();
      
      // Initialize all days with zero count
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        countsByDay[dateStr] = 0;
      }
      
      // Count views per day
      data.forEach((log: any) => {
        const dateStr = new Date(log.created_at).toISOString().split('T')[0];
        countsByDay[dateStr] = (countsByDay[dateStr] || 0) + 1;
      });
      
      // Convert to array format for charts
      return Object.entries(countsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
      console.error('Error getting thread views by day:', e);
      return [];
    }
  }
};

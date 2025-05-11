import { supabase } from '../supabase'

export interface Thread {
  id: string
  user_id: string
  title: string
  is_published: boolean
  is_private: boolean
  created_at: string
  updated_at: string
  fork_count?: number
  original_thread_id?: string | null
}

export interface ThreadSegment {
  id: string
  thread_id: string
  content: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface ThreadWithSegments extends Thread {
  segments: ThreadSegment[]
  tags: string[]
  cover_image: string | null
  reaction_counts: {
    '🧠': number
    '🔥': number
    '👏': number
    '👀': number
    '⚠': number
  }
  author: {
    name: string
    avatar: string | null
  }
}

export const threadService = {
  // Create a new thread with segments
  async createThread(title: string, segments: string[], tags: string[] = [], coverImage?: string, isPublished: boolean = true, isPrivate: boolean = false) {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Start a transaction
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .insert({ 
        user_id: user.id,
        title, 
        cover_image: coverImage,
        snippet: segments[0]?.substring(0, 150),
        is_published: isPublished,
        is_private: isPrivate
      })
      .select()
      .single()

    if (threadError) {
      console.error('Thread creation error:', threadError, {
        user_id: user.id,
        title,
        cover_image: coverImage,
        snippet: segments[0]?.substring(0, 150),
        is_published: isPublished,
        is_private: isPrivate
      });
      throw threadError;
    }
    if (!thread) throw new Error('Thread creation failed: No thread returned from Supabase. Check RLS policies and required fields.');

    // Create segments
    const segmentPromises = segments.map((content, index) =>
      supabase.from('thread_segments').insert({
        thread_id: thread.id,
        content,
        order_index: index,
      })
    )

    await Promise.all(segmentPromises)

    // Add tags if any
    if (tags.length > 0) {
      const tagPromises = tags.map(async (tagName) => {
        // First, get or create the tag
        const { data: tag, error: tagError } = await supabase
          .from('tags')
          .upsert({ name: tagName }, { onConflict: 'name' })
          .select()
          .single()

        if (tagError) {
          console.error('Tag upsert error:', tagError, tagName);
          throw tagError;
        }

        // Then link it to the thread
        await supabase.from('thread_tags').insert({
          thread_id: thread.id,
          tag_id: tag.id,
        })
      })

      await Promise.all(tagPromises)
    }

    // Initialize analytics for this thread
    await supabase.from('thread_analytics').insert({
      thread_id: thread.id,
      view_count: 0,
      unique_viewers: 0
    })

    return this.getThreadById(thread.id)
  },

  // Fork an existing thread
  async forkThread(originalThreadId: string) {
    // Get the original thread data
    const originalThread = await this.getThreadById(originalThreadId)
    if (!originalThread) throw new Error('Thread not found')

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create a new thread with the original content
    const { data: newThread, error: threadError } = await supabase
      .from('threads')
      .insert({ 
        title: `${originalThread.title} (Remix)`, 
        is_published: false, // Set as draft initially
        original_thread_id: originalThreadId,
        cover_image: originalThread.cover_image,
        snippet: originalThread.segments[0]?.content.substring(0, 150),
        user_id: user.id // Set the new thread's owner
      })
      .select()
      .single()

    if (threadError) throw threadError

    // Copy all segments
    const segmentPromises = originalThread.segments.map((segment, index) =>
      supabase.from('thread_segments').insert({
        thread_id: newThread.id,
        content: segment.content,
        order_index: index,
      })
    )
    await Promise.all(segmentPromises)

    // Copy tags
    if (originalThread.tags.length > 0) {
      const tagPromises = originalThread.tags.map(async (tagName) => {
        // Get or create the tag
        const { data: tag } = await supabase
          .from('tags')
          .upsert({ name: tagName }, { onConflict: 'name' })
          .select()
          .single()
        // Link it to the new thread
        await supabase.from('thread_tags').insert({
          thread_id: newThread.id,
          tag_id: tag.id,
        })
      })
      await Promise.all(tagPromises)
    }

    // Increment fork count on original thread
    await supabase
      .from('threads')
      .update({ fork_count: (originalThread.fork_count || 0) + 1 })
      .eq('id', originalThreadId)

    // Log the interaction
    await this.logInteraction(originalThreadId, 'fork')

    // Initialize analytics for this thread
    await supabase.from('thread_analytics').insert({
      thread_id: newThread.id,
      view_count: 0,
      unique_viewers: 0
    })

    return this.getThreadById(newThread.id)
  },

  // Get a thread by ID with all its segments and tags
  async getThreadById(id: string): Promise<ThreadWithSegments> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: thread, error: threadError } = await supabase
      .from('threads')
      .select(`
        *,
        segments:thread_segments(*),
        tags:thread_tags(tag:tags(name))
      `)
      .eq('id', id)
      .single()

    if (threadError) {
      console.error('Thread fetch error:', threadError);
      throw threadError;
    }

    // Only check privacy if the thread is private
    if (thread.is_private && !user) {
      throw new Error('This thread is private. Please log in to view it.');
    }

    // Get user data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', thread.user_id)
      .single();
    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Get reaction counts
    const { data: reactions } = await supabase
      .from('reactions')
      .select('type, count')
      .eq('thread_id', id)

    // Process the reactions manually
    const reaction_counts = {
      '🧠': 0,
      '🔥': 0,
      '👏': 0,
      '👀': 0,
      '⚠': 0,
    }

    if (reactions) {
      // Count the occurrences of each reaction type
      const countByType: Record<string, number> = {}
      reactions.forEach(reaction => {
        const type = reaction.type;
        if (!countByType[type]) {
          countByType[type] = 0;
        }
        countByType[type] += 1;
      });
      
      // Map the counts to our reaction_counts object
      Object.keys(countByType).forEach(type => {
        if (type in reaction_counts) {
          reaction_counts[type as keyof typeof reaction_counts] = countByType[type];
        }
      });
    }

    // Log the thread view
    this.logInteraction(id, 'view')
    
    // Increment view count in analytics
    this.incrementViewCount(id)

    return {
      ...thread,
      tags: thread.tags.map((t: any) => t.tag.name),
      reaction_counts,
      author: {
        name: profile?.name || 'Unknown Creator',
        avatar: profile?.avatar_url || null
      }
    }
  },

  // Log an interaction with a thread
  async logInteraction(threadId: string, interactionType: 'view' | 'reaction' | 'bookmark' | 'fork') {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return // Only log interactions for authenticated users
    
    await supabase.from('interaction_logs').insert({
      thread_id: threadId,
      user_id: user.user.id,
      interaction_type: interactionType
    })
  },

  // Increment view count in analytics
  async incrementViewCount(threadId: string) {
    const { data: user } = await supabase.auth.getUser()
    
    // Get current analytics
    const { data: analytics } = await supabase
      .from('thread_analytics')
      .select('*')
      .eq('thread_id', threadId)
      .single()
    
    if (analytics) {
      // Always increment view count
      await supabase
        .from('thread_analytics')
        .update({ 
          view_count: analytics.view_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('thread_id', threadId)
      
      // If authenticated, check if this is a unique viewer
      if (user.user) {
        // Check if user has viewed this thread before
        const { data: prevViews } = await supabase
          .from('interaction_logs')
          .select('*')
          .eq('thread_id', threadId)
          .eq('user_id', user.user.id)
          .eq('interaction_type', 'view')
          .limit(1)
        
        // If first view by this user, increment unique viewers
        if (prevViews && prevViews.length === 1) {
          await supabase
            .from('thread_analytics')
            .update({ 
              unique_viewers: analytics.unique_viewers + 1,
              updated_at: new Date().toISOString()
            })
            .eq('thread_id', threadId)
        }
      }
    } else {
      // Create analytics record if it doesn't exist
      await supabase.from('thread_analytics').insert({
        thread_id: threadId,
        view_count: 1,
        unique_viewers: user.user ? 1 : 0
      })
    }
  },

  // Get thread analytics
  async getThreadAnalytics(threadId: string) {
    const { data, error } = await supabase
      .from('thread_analytics')
      .select('*')
      .eq('thread_id', threadId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return { view_count: 0, unique_viewers: 0 }
      }
      throw error
    }
    
    return data
  },

  // Get detailed interaction data for a thread
  async getThreadInteractions(threadId: string) {
    const { data, error } = await supabase
      .from('interaction_logs')
      .select('interaction_type, created_at')
      .eq('thread_id', threadId)
    
    if (error) throw error
    
    return data
  },

  // Get threads with pagination and filters
  async getThreads({
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
    tags = [],
    userId,
    onlyPublished = true,
  }: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    tags?: string[]
    userId?: string
    onlyPublished?: boolean
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('threads')
      .select(`
        *,
        segments:thread_segments(*),
        tags:thread_tags(tag:tags(name))
      `)
      .range((page - 1) * limit, page * limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (onlyPublished) {
      query = query.eq('is_published', true);
    }

    // Always filter for public threads if not logged in
    if (!user) {
      query = query.eq('is_private', false);
      if (userId) {
        query = query.eq('user_id', userId);
      }
    } else {
      if (userId) {
        query = query.eq('user_id', userId);
      }
      // No is_private filter for logged-in users
    }

    if (tags.length > 0) {
      query = query.in('thread_tags.tag.name', tags);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch bookmarks count for all thread ids
    const threadIds = data.map((thread: any) => thread.id);
    let bookmarksMap: Record<string, number> = {};
    if (threadIds.length > 0) {
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('thread_id')
        .in('thread_id', threadIds);
      if (bookmarksData) {
        bookmarksData.forEach((row: any) => {
          bookmarksMap[row.thread_id] = (bookmarksMap[row.thread_id] || 0) + 1;
        });
      }
    }

    // Fetch reactions for all thread ids and count them per thread/type
    let reactionsMap: Record<string, Record<string, number>> = {};
    if (threadIds.length > 0) {
      const { data: reactionsData } = await supabase
        .from('reactions')
        .select('thread_id, type');
      if (reactionsData) {
        reactionsData.forEach((row: any) => {
          if (!reactionsMap[row.thread_id]) {
            reactionsMap[row.thread_id] = {
              '🧠': 0,
              '🔥': 0,
              '👏': 0,
              '👀': 0,
              '⚠': 0,
            };
          }
          if (row.type in reactionsMap[row.thread_id]) {
            reactionsMap[row.thread_id][row.type] += 1;
          }
        });
      }
    }

    return {
      threads: data.map((thread: any) => ({
        ...thread,
        tags: thread.tags.map((t: any) => t.tag.name),
        reaction_counts: reactionsMap[thread.id] || {
          '🧠': 0,
          '🔥': 0,
          '👏': 0,
          '👀': 0,
          '⚠': 0,
        },
        bookmarks: bookmarksMap[thread.id] || 0,
      })),
      total: count,
    };
  },

  // Update a thread
  async updateThread(
    id: string,
    updates: {
      title?: string
      is_published?: boolean
      segments?: { id?: string; content: string; order_index: number }[]
      tags?: string[]
      cover_image?: string
    }
  ) {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.is_published !== undefined) updateData.is_published = updates.is_published
    if (updates.cover_image !== undefined) updateData.cover_image = updates.cover_image
    
    // Update snippet if first segment is changed
    if (updates.segments && updates.segments.length > 0) {
      updateData.snippet = updates.segments[0].content.substring(0, 150)
    }
    
    const { error: threadError } = await supabase
      .from('threads')
      .update(updateData)
      .eq('id', id)

    if (threadError) throw threadError

    if (updates.segments) {
      // Delete existing segments
      await supabase.from('thread_segments').delete().eq('thread_id', id)

      // Insert new segments
      const segmentPromises = updates.segments.map((segment) =>
        supabase.from('thread_segments').insert({
          thread_id: id,
          content: segment.content,
          order_index: segment.order_index,
        })
      )

      await Promise.all(segmentPromises)
    }

    if (updates.tags) {
      // Delete existing tags
      await supabase.from('thread_tags').delete().eq('thread_id', id)

      // Add new tags
      const tagPromises = updates.tags.map(async (tagName) => {
        const { data: tag } = await supabase
          .from('tags')
          .upsert({ name: tagName }, { onConflict: 'name' })
          .select()
          .single()

        await supabase.from('thread_tags').insert({
          thread_id: id,
          tag_id: tag.id,
        })
      })

      await Promise.all(tagPromises)
    }

    return this.getThreadById(id)
  },

  // Delete a thread
  async deleteThread(id: string) {
    const { error } = await supabase.from('threads').delete().eq('id', id)
    if (error) throw error
  },

  // Subscribe to thread updates
  subscribeToThread(id: string, callback: (thread: ThreadWithSegments) => void) {
    return supabase
      .channel(`thread:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'threads',
          filter: `id=eq.${id}`,
        },
        async () => {
          const thread = await this.getThreadById(id)
          callback(thread)
        }
      )
      .subscribe()
  },
}

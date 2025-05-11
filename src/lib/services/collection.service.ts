import { supabase } from '../supabase'
import { ThreadWithSegments } from './thread.service'
import { collectionThreadsService } from './collection-threads.service'

export interface Collection {
  id: string
  user_id: string
  name: string
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface CollectionWithThreads extends Collection {
  threads: ThreadWithSegments[]
}

export const collectionService = {
  // Create a new collection
  async createCollection(name: string, isPrivate: boolean = true) {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name,
        is_private: isPrivate,
        user_id: user.id
      })
      .select()
      .single()
    if (error) throw error
    return data as Collection
  },

  // Get a collection by ID
  async getCollection(id: string): Promise<CollectionWithThreads> {
    // Get the collection details
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get thread IDs from our temporary service
    const threadIds = await collectionThreadsService.getThreadsForCollection(id);
    
    // If no threads, return empty array
    if (threadIds.length === 0) {
      return {
        ...data,
        threads: []
      };
    }
    
    // Fetch the threads
    const { data: threadsData, error: threadsError } = await supabase
      .from('threads')
      .select(`
        *,
        segments:thread_segments(*),
        tags:thread_tags(tag:tags(name))
      `)
      .in('id', threadIds);
    
    if (threadsError) {
      console.error('Error fetching threads:', threadsError);
      throw threadsError;
    }
    
    // Format the threads
    const formattedThreads = threadsData.map((thread: any) => ({
      ...thread,
      tags: thread.tags.map((tag: any) => tag.tag.name)
    }));

    return {
      ...data,
      threads: formattedThreads
    };
  },

  // Get user's collections
  async getUserCollections() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Collection[]
  },

  // Update a collection
  async updateCollection(
    id: string,
    updates: {
      name?: string
      is_private?: boolean
    }
  ) {
    const { data, error } = await supabase
      .from('collections')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Collection
  },

  // Delete a collection
  async deleteCollection(id: string) {
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) throw error
  },

  // Add a thread to a collection
  async addThreadToCollection(collectionId: string, threadId: string) {
    // Use the temporary collection-threads service
    try {
      await collectionThreadsService.addThreadToCollection(collectionId, threadId);
      console.log('Thread added to collection successfully');
    } catch (error) {
      console.error('Error adding thread to collection:', error);
      throw error;
    }
  },

  // Remove a thread from a collection
  async removeThreadFromCollection(collectionId: string, threadId: string) {
    try {
      await collectionThreadsService.removeThreadFromCollection(collectionId, threadId);
      console.log('Thread removed from collection successfully');
    } catch (error) {
      console.error('Error removing thread from collection:', error);
      throw error;
    }
  },

  // Subscribe to collection changes
  subscribeToCollections(callback: (collection: Collection) => void) {
    const channel = supabase.channel('collections')
    
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'collections',
      },
      async (payload) => {
        if (payload.new) {
          callback(payload.new as Collection)
        }
      }
    )

    channel.subscribe()
    return channel
  },
} 
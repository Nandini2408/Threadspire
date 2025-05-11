
import { supabase } from '../supabase'

interface BookmarkPayload {
  new?: { thread_id: string }
  old?: { thread_id: string }
}

export const bookmarkService = {
  // Add a thread to bookmarks
  async addBookmark(threadId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase.from('bookmarks').insert({
      thread_id: threadId,
      user_id: user.id
    })
    if (error) throw error
  },

  // Remove a thread from bookmarks
  async removeBookmark(threadId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
    if (error) throw error
  },

  // Check if a thread is bookmarked
  async isBookmarked(threadId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found" error
    return !!data
  },

  // Get user's bookmarked threads
  async getBookmarkedThreads({
    page = 1,
    limit = 10,
  }: {
    page?: number
    limit?: number
  } = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('thread_id')
      .eq('user_id', user.id)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false })

    if (bookmarksError) throw bookmarksError

    if (!bookmarks || bookmarks.length === 0) {
      return {
        threads: [],
        total: 0
      }
    }

    const threadIds = bookmarks.map((b) => b.thread_id)

    const { data: threads, error: threadsError } = await supabase
      .from('threads')
      .select(`
        *,
        segments:thread_segments(*),
        tags:thread_tags(tag:tags(name))
      `)
      .in('id', threadIds)

    if (threadsError) throw threadsError

    return {
      threads: threads.map((thread: any) => ({
        ...thread,
        tags: thread.tags.map((t: any) => t.tag.name),
      })),
      total: bookmarks.length,
    }
  },

  // Subscribe to bookmark changes
  subscribeToBookmarks(callback: (threadId: string, isBookmarked: boolean) => void) {
    // Creating a channel for bookmark changes
    const channel = supabase.channel('bookmarks-changes')
    
    // Use the correct pattern for subscribing to Postgres changes
    channel
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookmarks' 
        },
        async (payload: any) => {
          const threadId = payload.new?.thread_id || payload.old?.thread_id
          if (threadId) {
            const isBookmarked = await this.isBookmarked(threadId)
            callback(threadId, isBookmarked)
          }
        }
      )
      .subscribe()
    
    return channel
  },
}

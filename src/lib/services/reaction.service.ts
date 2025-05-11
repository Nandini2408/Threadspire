import { supabase } from '../supabase'

export type ReactionType = '🧠' | '🔥' | '👏' | '👀' | '⚠'

export interface ReactionCount {
  type: ReactionType
  count: number
}

export const reactionService = {
  // Add a reaction to a thread
  async addReaction(threadId: string, type: ReactionType) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Check if user already has this reaction
    const { data: existingReaction } = await supabase
      .from('reactions')
      .select('id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .eq('type', type)
      .single()
      
    if (existingReaction) {
      // Reaction already exists, do nothing
      return
    }
    
    const { error } = await supabase.from('reactions').insert({
      thread_id: threadId,
      user_id: user.id,
      type,
    })
    if (error) throw error
  },

  // Remove a reaction from a thread
  async removeReaction(threadId: string, type: ReactionType) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('reactions')
      .delete()
      .match({ thread_id: threadId, user_id: user.id, type })
    if (error) throw error
  },

  // Get user's reactions for a thread
  async getUserReactions(threadId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    
    const { data, error } = await supabase
      .from('reactions')
      .select('type')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
    if (error) throw error
    return data.map((r) => r.type as ReactionType)
  },

  // Get reaction counts for a thread
  async getReactionCounts(threadId: string) {
    const { data, error } = await supabase
      .from('reactions')
      .select('type')
      .eq('thread_id', threadId)
    if (error) throw error

    const counts = {
      '🧠': 0,
      '🔥': 0,
      '👏': 0,
      '👀': 0,
      '⚠': 0,
    } as Record<ReactionType, number>

    data.forEach((reaction) => {
      const type = reaction.type as ReactionType
      if (type in counts) {
        counts[type]++
      }
    })

    return counts
  },
  
  // Get users who reacted to a thread
  async getReactionUsers(threadId: string) {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        user_id,
        type,
        created_at,
        profiles:user_id(name, avatar_url)
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    
    return data.map(reaction => ({
      userId: reaction.user_id,
      type: reaction.type as ReactionType,
      userName: reaction.profiles?.name || 'Unknown Creator',
      userAvatar: reaction.profiles?.avatar_url || null,
      createdAt: reaction.created_at
    }))
  },

  // Subscribe to reaction changes for a thread
  subscribeToReactions(
    threadId: string,
    callback: (reactions: ReactionCount[]) => void
  ) {
    return supabase
      .channel(`reactions:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `thread_id=eq.${threadId}`,
        },
        async () => {
          const counts = await this.getReactionCounts(threadId)
          const reactions: ReactionCount[] = Object.entries(counts).map(([type, count]) => ({
            type: type as ReactionType,
            count
          }))
          callback(reactions)
        }
      )
      .subscribe()
  },
}

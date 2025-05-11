import { supabase } from '../supabase';

export const followService = {
  // Check if current user is following the author
  async isFollowing(currentUserId: string, authorId: string) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', authorId)
      .single();
    return !!data;
  },

  // Follow a user
  async follow(currentUserId: string, authorId: string) {
    await supabase.from('follows').insert({ follower_id: currentUserId, following_id: authorId });
    await followService.updateCounts(currentUserId, authorId);
  },

  // Unfollow a user
  async unfollow(currentUserId: string, authorId: string) {
    await supabase.from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', authorId);
    await followService.updateCounts(currentUserId, authorId);
  },

  // Update follower/following counts for both users
  async updateCounts(currentUserId: string, authorId: string) {
    // Update followers count for author
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', authorId);
    await supabase.from('profiles').update({ followers_count: followersCount }).eq('id', authorId);

    // Update following count for current user
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', currentUserId);
    await supabase.from('profiles').update({ following_count: followingCount }).eq('id', currentUserId);
  }
}; 
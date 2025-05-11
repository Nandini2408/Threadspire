import { supabase } from '../supabase';

export interface ThreadPreviewData {
  id?: string;
  title: string;
  coverImage: string | null;
  segments: string[];
  tags: string[];
  isPublic: boolean;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: Date;
}

export const previewService = {
  // Generate a preview for a thread without saving it to the database
  async generatePreview(previewData: ThreadPreviewData): Promise<ThreadPreviewData> {
    // Get current user for author information
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        ...previewData,
        authorName: 'Anonymous',
        authorAvatar: null,
        createdAt: new Date()
      };
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      ...previewData,
      authorName: profile?.name || user.user_metadata?.name || 'Anonymous',
      authorAvatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      createdAt: new Date()
    };
  },

  // Save a preview as a draft
  async savePreviewAsDraft(previewData: ThreadPreviewData): Promise<{ id: string }> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Format segments for storage
    const content = previewData.segments.map((segment, index) => ({
      content: segment,
      type: 'text',
      order_index: index
    }));

    // Save to drafts table
    const { data, error } = await supabase
      .from('drafts')
      .insert({
        user_id: user.id,
        title: previewData.title,
        content: JSON.stringify(content),
        tags: previewData.tags,
        is_private: !previewData.isPublic,
        cover_image: previewData.coverImage
      })
      .select()
      .single();

    if (error) throw error;
    return { id: data.id };
  },

  // Get a specific preview by ID (for resuming editing)
  async getPreviewById(previewId: string): Promise<ThreadPreviewData | null> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the draft
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', previewId)
      .eq('user_id', user.id) // Ensure it belongs to the current user
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    // Parse the content
    let segments: string[] = [];
    try {
      const parsedContent = JSON.parse(data.content);
      if (Array.isArray(parsedContent)) {
        segments = parsedContent.map(item => item.content || '');
      }
    } catch (e) {
      // If parsing fails, try to use content as a single segment
      segments = [data.content];
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      id: data.id,
      title: data.title,
      coverImage: data.cover_image,
      segments,
      tags: data.tags || [],
      isPublic: !data.is_private,
      authorName: profile?.name || user.user_metadata?.name || 'Anonymous',
      authorAvatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      createdAt: new Date(data.created_at)
    };
  }
};

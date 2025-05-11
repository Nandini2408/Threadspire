
import { supabase } from "@/integrations/supabase/client";

export const draftService = {
  async createDraft(title: string, content: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('drafts')
      .insert([{ user_id: user.id, title, content }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateDraft(id: string, title: string, content: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('drafts')
      .update({ title, content })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getDraftsByUser(userId: string) {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async deleteDraft(id: string) {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  async publishDraft(draftId: string) {
    // 1. Get the draft
    const { data: draft, error: getError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single();
    if (getError) throw getError;

    // Parse content if it's a string
    let contentArray = Array.isArray(draft.content) ? draft.content : [];
    if (typeof draft.content === 'string') {
      try {
        contentArray = JSON.parse(draft.content);
      } catch (e) {
        console.error('Error parsing draft content:', e);
        contentArray = [{ content: draft.content }];
      }
    } else if (draft.content && typeof draft.content === 'object') {
      // Handle case where content is already an object
      contentArray = Array.isArray(draft.content) ? draft.content : [draft.content];
    }

    // 2. Insert into threads table (no content field)
    const threadInsert = {
      user_id: draft.user_id,
      title: draft.title,
      is_published: true,
      snippet: Array.isArray(contentArray) && contentArray.length > 0 && typeof contentArray[0] === 'object' && 'content' in contentArray[0]
        ? String(contentArray[0].content).substring(0, 150)
        : null,
      // Add cover_image, tags, etc. if your schema requires them
    };

    const { data: thread, error: insertError } = await supabase
      .from('threads')
      .insert([threadInsert])
      .select()
      .single();
    if (insertError) {
      console.error('Insert error:', insertError, threadInsert);
      throw insertError;
    }

    // 3. Insert segments into thread_segments table
    if (Array.isArray(contentArray)) {
      for (let i = 0; i < contentArray.length; i++) {
        const segment = contentArray[i];
        // Handle different segment content formats safely
        let segmentContent = '';
        if (segment && typeof segment === 'object' && 'content' in segment) {
          segmentContent = typeof segment.content === 'string' ? segment.content : JSON.stringify(segment.content);
        } else if (typeof segment === 'string') {
          segmentContent = segment;
        } else {
          segmentContent = JSON.stringify(segment);
        }
                               
        const { error: segError } = await supabase
          .from('thread_segments')
          .insert({
            thread_id: thread.id,
            content: segmentContent,
            order_index: i,
          });
        if (segError) {
          console.error('Segment insert error:', segError, segment);
          throw segError;
        }
      }
    }

    // 4. Delete the draft
    await this.deleteDraft(draftId);

    return thread;
  },
  async getDraftById(id: string) {
    // Get the draft data
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Draft not found');
    
    // Ensure content is properly formatted for the editor
    let formattedContent = data.content;
    
    // Handle string content (parse JSON if needed)
    if (typeof data.content === 'string') {
      try {
        // Attempt to parse as JSON
        const parsed = JSON.parse(data.content);
        formattedContent = parsed;
      } catch (e) {
        // If parsing fails, wrap the string in a content object
        formattedContent = [{ content: data.content, type: 'text' }];
      }
    }
    
    // Ensure content is an array
    if (!Array.isArray(formattedContent)) {
      formattedContent = [formattedContent];
    }
    
    // Return the draft with properly formatted content
    return {
      ...data,
      content: formattedContent
    };
  },
  // Add more methods as needed (getDraft, deleteDraft, etc.)
};

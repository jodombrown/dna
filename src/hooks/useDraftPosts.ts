/**
 * Hook for managing draft posts
 * Enables save/load/delete draft functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DraftPost {
  id: string;
  content: string;
  post_type: string;
  media_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useDraftPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's drafts
  const { data: drafts, isLoading } = useQuery({
    queryKey: ['draft-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_user_drafts', {
        p_user_id: user.id,
        p_limit: 10,
      });

      if (error) throw error;
      return (data as DraftPost[]) || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Save draft
  const saveDraft = useMutation({
    mutationFn: async ({ content, postType }: { content: string; postType?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('draft_posts')
        .insert({
          author_id: user.id,
          content,
          post_type: postType || 'post',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-posts'] });
      toast.success('Draft saved');
    },
    onError: (error: any) => {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    },
  });

  // Update draft
  const updateDraft = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('draft_posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('author_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-posts'] });
      toast.success('Draft updated');
    },
    onError: (error: any) => {
      console.error('Error updating draft:', error);
      toast.error('Failed to update draft');
    },
  });

  // Delete draft
  const deleteDraft = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('draft_posts')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft-posts'] });
      toast.success('Draft deleted');
    },
    onError: (error: any) => {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    },
  });

  return {
    drafts,
    isLoading,
    saveDraft,
    updateDraft,
    deleteDraft,
  };
};

/**
 * Hook for managing draft posts
 * Enables save/load/delete draft functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
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

  // Fetch user's drafts - disabled until RPC exists
  const { data: drafts, isLoading } = useQuery({
    queryKey: ['draft-posts', user?.id],
    queryFn: async () => {
      // Draft posts feature not yet implemented in database
      return [] as DraftPost[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Save draft - stores in localStorage until database table exists
  const saveDraft = useMutation({
    mutationFn: async ({ content, postType }: { content: string; postType?: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Store draft in localStorage until database table exists
      const draft: DraftPost = {
        id: crypto.randomUUID(),
        content,
        post_type: postType || 'post',
        media_urls: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const existingDrafts = JSON.parse(localStorage.getItem(`drafts_${user.id}`) || '[]');
      existingDrafts.unshift(draft);
      localStorage.setItem(`drafts_${user.id}`, JSON.stringify(existingDrafts.slice(0, 10)));
      
      return draft;
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

  // Update draft - uses localStorage until database table exists
  const updateDraft = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');

      const existingDrafts: DraftPost[] = JSON.parse(localStorage.getItem(`drafts_${user.id}`) || '[]');
      const draftIndex = existingDrafts.findIndex(d => d.id === id);
      if (draftIndex === -1) throw new Error('Draft not found');
      
      existingDrafts[draftIndex] = {
        ...existingDrafts[draftIndex],
        content,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(`drafts_${user.id}`, JSON.stringify(existingDrafts));
      
      return existingDrafts[draftIndex];
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

  // Delete draft - uses localStorage until database table exists
  const deleteDraft = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const existingDrafts: DraftPost[] = JSON.parse(localStorage.getItem(`drafts_${user.id}`) || '[]');
      const filteredDrafts = existingDrafts.filter(d => d.id !== id);
      localStorage.setItem(`drafts_${user.id}`, JSON.stringify(filteredDrafts));
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

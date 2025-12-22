/**
 * DNA | FEED - Reshare Hook
 *
 * Comprehensive hook for managing post reshares.
 * Implements the CONVEY principle for content amplification.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createNotification } from '@/services/notificationService';

interface UseReshareOptions {
  postId: string;
  userId: string | undefined;
  originalAuthorId?: string;
  originalAuthorName?: string;
  onSuccess?: () => void;
}

export function useReshare({
  postId,
  userId,
  originalAuthorId,
  originalAuthorName,
  onSuccess,
}: UseReshareOptions) {
  const queryClient = useQueryClient();
  const [isReshareDialogOpen, setIsReshareDialogOpen] = useState(false);

  // Check if user has reshared this post
  const { data: hasReshared = false, isLoading: isCheckingReshare } = useQuery({
    queryKey: ['hasReshared', postId, userId],
    queryFn: async () => {
      if (!userId || !postId) return false;

      const { data, error } = await supabase.rpc('check_user_reshared', {
        p_user_id: userId,
        p_post_id: postId,
      });

      if (error) {
        console.error('Error checking reshare status:', error);
        return false;
      }

      return data || false;
    },
    enabled: !!userId && !!postId,
    staleTime: 30000,
  });

  // Get reshare count
  const { data: reshareCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: ['reshareCount', postId],
    queryFn: async () => {
      if (!postId) return 0;

      const { data, error } = await supabase.rpc('get_reshare_count', {
        p_post_id: postId,
      });

      if (error) {
        console.error('Error getting reshare count:', error);
        return 0;
      }

      return data || 0;
    },
    enabled: !!postId,
    staleTime: 30000,
  });

  // Create reshare mutation
  const createReshareMutation = useMutation({
    mutationFn: async (commentary?: string) => {
      if (!userId) throw new Error('Not authenticated');

      // Create the reshare post
      const { error } = await supabase.from('posts').insert({
        author_id: userId,
        content: commentary || '',
        post_type: 'reshare',
        privacy_level: 'public',
        original_post_id: postId,
        share_commentary: commentary || null,
      });

      if (error) throw error;

      // Send notification to original author (if not self-reshare)
      if (originalAuthorId && originalAuthorId !== userId) {
        try {
          await createNotification({
            user_id: originalAuthorId,
            type: 'post_reshare',
            title: 'Your post was reshared',
            message: 'Someone shared your post with their network',
            link_url: `/feed?highlight=${postId}`,
            payload: {
              original_post_id: postId,
              resharer_id: userId,
            },
          });
        } catch (notifError) {
          // Don't fail the reshare if notification fails
          console.error('Failed to send reshare notification:', notifError);
        }
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['hasReshared', postId] });
      queryClient.invalidateQueries({ queryKey: ['reshareCount', postId] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-feed-posts'] });

      toast.success('Post shared to your network!');
      setIsReshareDialogOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Reshare error:', error);
      toast.error(error.message || 'Failed to share post');
    },
  });

  // Delete reshare mutation (undo)
  const deleteReshareMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('delete_reshare', {
        p_user_id: userId,
        p_original_post_id: postId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['hasReshared', postId] });
      queryClient.invalidateQueries({ queryKey: ['reshareCount', postId] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-feed-posts'] });

      toast.success('Reshare removed');
    },
    onError: (error: Error) => {
      console.error('Undo reshare error:', error);
      toast.error('Failed to remove reshare');
    },
  });

  const handleReshare = useCallback(
    (commentary?: string) => {
      createReshareMutation.mutate(commentary);
    },
    [createReshareMutation]
  );

  const handleUndoReshare = useCallback(() => {
    deleteReshareMutation.mutate();
  }, [deleteReshareMutation]);

  const handleQuickReshare = useCallback(() => {
    if (hasReshared) {
      handleUndoReshare();
    } else {
      handleReshare();
    }
  }, [hasReshared, handleReshare, handleUndoReshare]);

  const openReshareDialog = useCallback(() => {
    setIsReshareDialogOpen(true);
  }, []);

  const closeReshareDialog = useCallback(() => {
    setIsReshareDialogOpen(false);
  }, []);

  return {
    hasReshared,
    reshareCount,
    isLoading:
      createReshareMutation.isPending ||
      deleteReshareMutation.isPending ||
      isCheckingReshare ||
      isLoadingCount,
    isReshareDialogOpen,
    openReshareDialog,
    closeReshareDialog,
    handleReshare,
    handleQuickReshare,
    handleUndoReshare,
  };
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePostActions(postId: string, authorId: string, currentUserId?: string) {
  const queryClient = useQueryClient();
  const isOwnPost = authorId === currentUserId;

  // Edit post
  const editPost = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId || !isOwnPost) throw new Error('Not authorized');

      const { error } = await supabase
        .from('posts')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success('Post updated');
    },
    onError: () => toast.error('Failed to update post'),
  });

  // Delete post
  const deletePost = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !isOwnPost) throw new Error('Not authorized');

      const { error } = await supabase
        .from('posts')
        .update({ is_deleted: true })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  // Pin/unpin post to profile
  const togglePin = useMutation({
    mutationFn: async (isPinned: boolean) => {
      if (!currentUserId || !isOwnPost) throw new Error('Not authorized');

      const { error } = await supabase
        .from('posts')
        .update({ pinned_at: isPinned ? new Date().toISOString() : null })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, isPinned) => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success(isPinned ? 'Post pinned to profile' : 'Post unpinned');
    },
    onError: () => toast.error('Failed to update pin status'),
  });

  // Toggle comments
  const toggleComments = useMutation({
    mutationFn: async (disabled: boolean) => {
      if (!currentUserId || !isOwnPost) throw new Error('Not authorized');

      const { error } = await supabase
        .from('posts')
        .update({ comments_disabled: disabled })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: (_, disabled) => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success(disabled ? 'Comments turned off' : 'Comments turned on');
    },
    onError: () => toast.error('Failed to update comment settings'),
  });

  // Report post
  const reportPost = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description?: string }) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { error } = await supabase.from('post_reports').insert({
        post_id: postId,
        reporter_id: currentUserId,
        reason,
        description,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Post reported. We will review it shortly.');
    },
    onError: () => toast.error('Failed to report post'),
  });

  // Hide post from feed
  const hidePost = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { error } = await supabase.from('hidden_posts').insert({
        user_id: currentUserId,
        post_id: postId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success('Post hidden from your feed');
    },
    onError: () => toast.error('Failed to hide post'),
  });

  // Mute author
  const muteAuthor = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { error } = await supabase.from('muted_authors').insert({
        user_id: currentUserId,
        muted_user_id: authorId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success('Author muted. You won\'t see their posts.');
    },
    onError: () => toast.error('Failed to mute author'),
  });

  // Copy link
  const copyLink = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return {
    isOwnPost,
    editPost,
    deletePost,
    togglePin,
    toggleComments,
    reportPost,
    hidePost,
    muteAuthor,
    copyLink,
  };
}

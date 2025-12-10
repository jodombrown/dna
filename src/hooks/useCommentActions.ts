import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCommentActions(commentId: string, authorId: string, postId: string, currentUserId?: string) {
  const queryClient = useQueryClient();
  const isOwnComment = authorId === currentUserId;

  // Edit comment
  const editComment = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId || !isOwnComment) throw new Error('Not authorized');

      const { error } = await supabase
        .from('post_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threaded-comments', postId] });
      toast.success('Comment updated');
    },
    onError: () => toast.error('Failed to update comment'),
  });

  // Delete comment
  const deleteComment = useMutation({
    mutationFn: async () => {
      if (!currentUserId || !isOwnComment) throw new Error('Not authorized');

      const { error } = await supabase
        .from('post_comments')
        .update({ is_deleted: true })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threaded-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  // Report comment
  const reportComment = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description?: string }) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { error } = await supabase.from('comment_reports').insert({
        comment_id: commentId,
        reporter_id: currentUserId,
        reason,
        description,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comment reported. We will review it shortly.');
    },
    onError: () => toast.error('Failed to report comment'),
  });

  return {
    isOwnComment,
    editComment,
    deleteComment,
    reportComment,
  };
}

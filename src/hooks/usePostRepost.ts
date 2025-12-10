import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RepostParams {
  postId: string;
  userId: string;
  commentary?: string;
}

export function usePostRepost() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const repostMutation = useMutation({
    mutationFn: async ({ postId, userId, commentary }: RepostParams) => {
      // First, fetch the original post to get its content
      const { data: originalPost, error: fetchError } = await supabase
        .from('posts')
        .select('content, image_url, link_url, link_title, link_description, link_metadata')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      // Create the reshare post with proper original_post_id reference
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: userId,
          content: commentary || '', // User's commentary goes in content
          post_type: 'reshare',
          privacy_level: 'public',
          original_post_id: postId, // Link to original post
          share_commentary: commentary || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast({
        title: 'Post shared!',
        description: 'Your share has been added to your feed',
      });
    },
    onError: (error: Error) => {
      console.error('Error sharing post:', error);
      toast({
        title: 'Share failed',
        description: error.message || 'Failed to share post. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    repost: repostMutation.mutate,
    isReposting: repostMutation.isPending,
  };
}


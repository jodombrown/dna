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
      // Create a new post as a share/repost
      const shareContent = commentary 
        ? commentary 
        : `Shared a post by ${userId}`;

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: userId,
          content: shareContent,
          post_type: 'update',
          privacy_level: 'public',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-feed-posts'] });
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


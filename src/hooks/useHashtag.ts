import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hashtagService, HashtagDetails, HashtagPost } from '@/services/hashtagService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useHashtag(hashtagName: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get hashtag details
  const {
    data: hashtag,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useQuery({
    queryKey: ['hashtag', hashtagName],
    queryFn: () => hashtagService.getDetails(hashtagName!, user?.id),
    enabled: !!hashtagName,
    staleTime: 60000
  });

  // Get hashtag posts
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    error: postsError
  } = useQuery({
    queryKey: ['hashtagPosts', hashtagName],
    queryFn: () => hashtagService.getPosts(hashtagName!, 20, 0, 'recent'),
    enabled: !!hashtagName,
    staleTime: 30000
  });

  // Toggle follow mutation
  const toggleFollowMutation = useMutation({
    mutationFn: () => {
      if (!hashtag?.id || !user?.id) throw new Error('Not authenticated');
      return hashtagService.toggleFollow(hashtag.id, user.id);
    },
    onSuccess: (isNowFollowing) => {
      queryClient.invalidateQueries({ queryKey: ['hashtag', hashtagName] });
      toast.success(isNowFollowing ? `Following #${hashtagName}` : `Unfollowed #${hashtagName}`);
    },
    onError: () => {
      toast.error('Failed to update follow status');
    }
  });

  return {
    hashtag,
    posts,
    isLoading: isLoadingDetails || isLoadingPosts,
    error: detailsError || postsError,
    isFollowing: hashtag?.is_following || false,
    toggleFollow: () => toggleFollowMutation.mutate(),
    isTogglingFollow: toggleFollowMutation.isPending
  };
}

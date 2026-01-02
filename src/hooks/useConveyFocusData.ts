/**
 * useConveyFocusData - Data Hook for Convey Focus Panel
 *
 * Fetches and manages data for the Convey Focus panel including:
 * - User's content performance
 * - Recent engagement notifications
 * - Trending content in the diaspora
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { STALE_TIMES } from '@/lib/queryClient';

export interface UserStory {
  id: string;
  title: string;
  excerpt: string;
  viewCount: number;
  reactionCount: number;
  commentCount: number;
  isTrending: boolean;
  createdAt: string;
}

export interface EngagementNotification {
  id: string;
  type: 'comment' | 'reaction' | 'share' | 'view';
  message: string;
  postId: string;
  actorName: string | null;
  timestamp: string;
}

export interface TrendingContent {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string | null;
  viewCount: number;
  reactionCount: number;
}

export function useConveyFocusData() {
  const { user } = useAuth();

  // Fetch user's recent stories with performance metrics
  const storiesQuery = useQuery({
    queryKey: ['conveyFocus', 'stories', user?.id],
    queryFn: async (): Promise<UserStory[]> => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          post_likes (id),
          post_comments (id),
          post_reactions (id)
        `)
        .eq('author_id', user?.id)
        .eq('is_deleted', false)
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      return (data || []).map((post: any) => {
        const reactionCount = (post.post_likes?.length || 0) + (post.post_reactions?.length || 0);
        const commentCount = post.post_comments?.length || 0;
        const totalEngagement = reactionCount + commentCount;

        return {
          id: post.id,
          title: post.content?.substring(0, 60) || 'Untitled',
          excerpt: post.content?.substring(0, 100) || '',
          viewCount: 0, // TODO: Add view tracking
          reactionCount,
          commentCount,
          isTrending: totalEngagement > 20,
          createdAt: post.created_at,
        };
      });
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Fetch recent engagement on user's content
  const engagementQuery = useQuery({
    queryKey: ['conveyFocus', 'engagement', user?.id],
    queryFn: async (): Promise<EngagementNotification[]> => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get recent comments on user's posts
      const { data: comments } = await supabase
        .from('post_comments')
        .select(`
          id,
          created_at,
          post_id,
          posts!inner (author_id),
          commenter:profiles!post_comments_author_id_fkey (full_name)
        `)
        .eq('posts.author_id', user?.id)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent reactions on user's posts
      const { data: reactions } = await supabase
        .from('post_reactions')
        .select(`
          id,
          created_at,
          post_id,
          posts!inner (author_id),
          reactor:profiles!post_reactions_user_id_fkey (full_name)
        `)
        .eq('posts.author_id', user?.id)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(5);

      const notifications: EngagementNotification[] = [];

      (comments || []).forEach((c: any) => {
        notifications.push({
          id: c.id,
          type: 'comment',
          message: `${c.commenter?.full_name || 'Someone'} commented on your story`,
          postId: c.post_id,
          actorName: c.commenter?.full_name,
          timestamp: c.created_at,
        });
      });

      (reactions || []).forEach((r: any) => {
        notifications.push({
          id: r.id,
          type: 'reaction',
          message: `${r.reactor?.full_name || 'Someone'} reacted to your story`,
          postId: r.post_id,
          actorName: r.reactor?.full_name,
          timestamp: r.created_at,
        });
      });

      // Sort by timestamp and return top 5
      return notifications
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Fetch trending content in the community
  const trendingQuery = useQuery({
    queryKey: ['conveyFocus', 'trending'],
    queryFn: async (): Promise<TrendingContent[]> => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          author:profiles!posts_author_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          post_likes (id),
          post_reactions (id)
        `)
        .eq('is_deleted', false)
        .gte('created_at', oneWeekAgo)
        .order('created_at', { ascending: false })
        .limit(20);

      // Score by engagement and return top trending
      const scored = (data || []).map((post: any) => {
        const reactionCount = (post.post_likes?.length || 0) + (post.post_reactions?.length || 0);
        return {
          id: post.id,
          title: post.content?.substring(0, 60) || 'Untitled',
          excerpt: post.content?.substring(0, 100) || '',
          authorName: post.author?.full_name || 'Unknown',
          authorAvatar: post.author?.avatar_url,
          viewCount: 0,
          reactionCount,
          score: reactionCount,
        };
      });

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ score, ...rest }) => rest);
    },
    staleTime: STALE_TIMES.medium,
  });

  const hasUserContent = (storiesQuery.data?.length || 0) > 0;
  const totalEngagement = storiesQuery.data?.reduce(
    (sum, s) => sum + s.reactionCount + s.commentCount, 0
  ) || 0;

  return {
    userStories: storiesQuery.data || [],
    engagementNotifications: engagementQuery.data || [],
    trendingContent: trendingQuery.data || [],
    isLoading: storiesQuery.isLoading,
    hasUserContent,
    totalEngagement,
    trendingStoryCount: storiesQuery.data?.filter(s => s.isTrending).length || 0,
    refetch: () => {
      storiesQuery.refetch();
      engagementQuery.refetch();
      trendingQuery.refetch();
    },
  };
}

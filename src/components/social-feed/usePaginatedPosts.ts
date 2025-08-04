import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Post } from './PostList';

interface UsePaginatedPostsProps {
  pillar?: string;
  limit?: number;
  refreshKey?: number;
}

interface UsePaginatedPostsReturn {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
}

export const usePaginatedPosts = ({
  pillar,
  limit = 10,
  refreshKey = 0
}: UsePaginatedPostsProps = {}): UsePaginatedPostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = useCallback(async (isLoadMore = false, isRefresh = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentOffset = isRefresh ? 0 : (isLoadMore ? offset : 0);
      
      // Build the query
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          media_url,
          type,
          pillar,
          created_at,
          author_id,
          shared_post_id,
          profiles!posts_author_id_fkey (
            id,
            full_name,
            avatar_url,
            location,
            professional_role
          ),
          shared_post:posts!shared_post_id (
            id,
            content,
            media_url,
            type,
            pillar,
            created_at,
            author_id,
            profiles!posts_author_id_fkey (
              id,
              full_name,
              avatar_url,
              location,
              professional_role
            )
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      // Filter by pillar if specified
      if (pillar) {
        query = query.eq('pillar', pillar);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      if (!postsData) {
        if (isRefresh) {
          setPosts([]);
          setOffset(0);
        }
        setHasMore(false);
        return;
      }

      // Check if we have more data
      const hasMoreData = postsData.length === limit;
      setHasMore(hasMoreData);

      if (postsData.length === 0) {
        if (isRefresh) {
          setPosts([]);
          setOffset(0);
        }
        return;
      }

      // Get post IDs for likes and comments count
      const postIds = postsData.map(post => post.id);

      // Fetch engagement data in parallel
      const [likesResponse, commentsResponse, userLikesResponse] = await Promise.all([
        // Get like counts
        supabase
          .from('post_likes')
          .select('post_id')
          .in('post_id', postIds),
        
        // Get comment counts
        supabase
          .from('post_comments')
          .select('post_id')
          .in('post_id', postIds),
        
        // Get user's likes if authenticated
        user ? supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds) : Promise.resolve({ data: [] })
      ]);

      const likesData = likesResponse.data || [];
      const commentsData = commentsResponse.data || [];
      const userLikesData = userLikesResponse.data || [];

      // Combine data
      const postsWithEngagement = postsData.map(post => {
        const likeCount = likesData.filter(like => like.post_id === post.id).length;
        const commentCount = commentsData.filter(comment => comment.post_id === post.id).length;
        const userHasLiked = userLikesData.some(like => like.post_id === post.id);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
          user_has_liked: userHasLiked,
        };
      });

      if (isRefresh) {
        setPosts(postsWithEngagement);
        setOffset(postsWithEngagement.length);
      } else if (isLoadMore) {
        setPosts(prev => [...prev, ...postsWithEngagement]);
        setOffset(prev => prev + postsWithEngagement.length);
      } else {
        setPosts(postsWithEngagement);
        setOffset(postsWithEngagement.length);
      }

    } catch (error) {
      console.error('Error fetching posts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      setError(errorMessage);
      
      toast({
        title: "Error loading posts",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pillar, limit, offset, user?.id, toast]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await fetchPosts(true);
  }, [hasMore, loadingMore, fetchPosts]);

  const refresh = useCallback(async () => {
    await fetchPosts(false, true);
  }, [fetchPosts]);

  // Initial load and refresh on dependency changes
  useEffect(() => {
    fetchPosts();
  }, [pillar, user?.id, refreshKey]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    refresh,
    error
  };
};
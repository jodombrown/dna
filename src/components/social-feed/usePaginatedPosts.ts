import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Post } from './PostList';

interface UsePaginatedPostsProps {
  pillar?: string;
  limit?: number;
  refreshKey?: number;
  relevantOnly?: boolean; // When true, scope feed to connections and collaborators
  sortMode?: 'relevant' | 'trending' | 'spotlight';
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
  refreshKey = 0,
  relevantOnly = false,
  sortMode = 'relevant',
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
      
      // Optionally scope to relevant authors (connections + collaborators + self)
      let authorIds: string[] | null = null;
      // Connections lookup disabled - contact_requests table dropped
      // Using connections table as fallback
      if (relevantOnly && user?.id) {
        const [connectionsRes, mySpacesRes] = await Promise.all([
          supabase
            .from('connections')
            .select('a, b')
            .eq('status', 'accepted')
            .or(`a.eq.${user.id},b.eq.${user.id}`),
          supabase
            .from('collaboration_memberships')
            .select('space_id')
            .eq('user_id', user.id)
            .eq('status', 'approved')
        ]);

        const mySpaceIds = (mySpacesRes.data || []).map((r: any) => r.space_id);
        let collaborators: string[] = [];
        if (mySpaceIds.length > 0) {
          const { data: memberRows } = await supabase
            .from('collaboration_memberships')
            .select('user_id, space_id')
            .in('space_id', mySpaceIds)
            .eq('status', 'approved');
          collaborators = (memberRows || [])
            .map((r: any) => r.user_id)
            .filter((id: string | null) => !!id && id !== user.id);
        }

        const connections: string[] = (connectionsRes.data || [])
          .map((r: any) => (r.a === user.id ? r.b : r.a))
          .filter((id: string | null) => !!id && id !== user.id);

        authorIds = Array.from(new Set<string>([user.id, ...connections, ...collaborators]));
      }
      
      // Build the base posts query
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
          status,
          embed_metadata,
          profiles!author_id (
            id,
            full_name,
            avatar_url,
            location,
            profession
          )
        `)
        .eq('status', 'published')
        .eq('visibility', 'public');

      // Spotlight filter (admin selected or featured)
      if (sortMode === 'spotlight') {
        query = query.or('type.eq.spotlight,status.eq.featured');
      }

      // Apply relevance filter if applicable
      if (relevantOnly) {
        if (authorIds && authorIds.length > 0) {
          query = query.in('author_id', authorIds);
        } else {
          // No relevant authors found, return empty
          if (isRefresh) {
            setPosts([]);
            setOffset(0);
          }
          setHasMore(false);
          return;
        }
      }

      // Filter by pillar if specified
      if (pillar) {
        query = query.eq('pillar', pillar);
      }

      // Recency window for trending
      if (sortMode === 'trending') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', sevenDaysAgo);
      }

      // Order and paginate by recency; we will re-rank client-side for trending
      query = query.order('created_at', { ascending: false })
                   .range(currentOffset, currentOffset + limit - 1);

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
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
          .from('comments')
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
      let postsWithEngagement = postsData.map(post => {
        const likeCount = likesData.filter(like => like.post_id === post.id).length;
        const commentCount = commentsData.filter(comment => comment.post_id === post.id).length;
        const userHasLiked = userLikesData.some(like => like.post_id === post.id);

        return {
          ...post,
          // Ensure profiles is always an object, not null
          profiles: post.profiles || {
            id: post.author_id,
            full_name: 'Unknown User',
            avatar_url: null,
            location: null,
            profession: null
          },
          like_count: likeCount,
          comment_count: commentCount,
          user_has_liked: userHasLiked,
        };
      });

      // Re-rank for trending: score by engagement with light recency boost
      if (sortMode === 'trending') {
        const now = Date.now();
        postsWithEngagement = postsWithEngagement
          .map(p => {
            const ageHours = Math.max(1, (now - new Date(p.created_at).getTime()) / 36e5);
            const engagement = (p.like_count || 0) * 2 + (p.comment_count || 0) * 3;
            const score = engagement / Math.pow(ageHours, 0.5); // mild time decay
            return { ...p, _trending_score: score } as any;
          })
          .sort((a: any, b: any) => (b._trending_score || 0) - (a._trending_score || 0));
      }

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
  }, [pillar, limit, offset, user?.id, toast, relevantOnly, sortMode]);

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
  }, [pillar, user?.id, refreshKey, relevantOnly, sortMode]);

  return {
    posts,
    loading,
    hasMore,
    loadMore,
    refresh,
    error
  };
};
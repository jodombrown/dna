import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FeedMode, Pillar, FeedPost } from '@/components/dashboard/DnaDashboard';

interface UsePaginatedPostsArgs {
  mode: FeedMode;
  pillar: Pillar;
  resetKey?: string;
}

export default function usePaginatedPosts({ mode, pillar, resetKey }: UsePaginatedPostsArgs) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadPosts = useCallback(async (pageToLoad: number = 0, reset: boolean = false) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          pillar,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            headline
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageToLoad * 10, (pageToLoad * 10) + 9);

      // Filter by pillar if not "all"
      if (pillar !== 'all') {
        query = query.eq('pillar', pillar);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedPosts: FeedPost[] = (data || []).map(post => ({
        id: post.id,
        body: post.content || '',
        pillar: post.pillar as "connect" | "collaborate" | "contribute",
        created_at: post.created_at,
        author: {
          name: (post.profiles as any)?.full_name || (post.profiles as any)?.username || 'Member',
          role: (post.profiles as any)?.headline || 'Professional',
          avatarUrl: (post.profiles as any)?.avatar_url || undefined
        }
      }));

      if (reset) {
        setPosts(mappedPosts);
      } else {
        setPosts(prev => [...prev, ...mappedPosts]);
      }

      setHasMore(mappedPosts.length === 10);
      setPage(pageToLoad);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pillar]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPosts(page + 1, false);
    }
  }, [loadPosts, page, isLoading, hasMore]);

  const reset = useCallback(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    loadPosts(0, true);
  }, [loadPosts]);

  // Reset when dependencies change
  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  return {
    posts,
    isLoading,
    hasMore,
    loadMore,
    reset,
    refetch: reset
  };
}
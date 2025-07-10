import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeQuery } from './useRealtimeQuery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Post {
  id: string;
  content: string;
  pillar: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  media_url?: string;
  hashtags?: string[];
  visibility: string;
  author?: {
    full_name: string;
    avatar_url?: string;
    id: string;
  };
  reactions?: any[];
  comments_count?: number;
  adin_score?: number;
  adin_signals?: string[];
}

export const useRealTimeFeed = () => {
  const { user } = useAuth();

  const {
    data: posts,
    loading,
    error,
    refetch
  } = useRealtimeQuery<Post>('public-posts-feed', {
    table: 'posts',
    select: `
      *,
      profiles:author_id (
        full_name,
        avatar_url,
        id
      )
    `,
    filter: 'visibility=eq.public',
    orderBy: { column: 'created_at', ascending: false },
    limit: 20,
    enabled: true
  });

  // Transform posts to include author data
  const transformedPosts = posts.map(post => ({
    ...post,
    author: (post as any).profiles
  }));

  const addPost = useCallback((newPost: Post) => {
    // The realtime query will automatically handle this
    // This is kept for API compatibility
  }, []);

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    // The realtime query will automatically handle this
    // This is kept for API compatibility
  }, []);

  const removePost = useCallback((postId: string) => {
    // The realtime query will automatically handle this
    // This is kept for API compatibility
  }, []);

  const createPost = useCallback(async (content: string, pillar: string, mediaUrl?: string, hashtags?: string[]) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          pillar,
          author_id: user.id,
          media_url: mediaUrl,
          hashtags,
          visibility: 'public'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Post created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return null;
    }
  }, [user]);

  return {
    posts: transformedPosts,
    loading,
    error,
    addPost, // Deprecated but kept for compatibility
    updatePost, // Deprecated but kept for compatibility  
    removePost, // Deprecated but kept for compatibility
    createPost,
    refetch
  };
};
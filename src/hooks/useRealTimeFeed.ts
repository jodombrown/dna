import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url,
            id
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const postsWithAuthor = data?.map(post => ({
        ...post,
        author: post.profiles as any
      })) || [];

      setPosts(postsWithAuthor);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription
    const channel = supabase
      .channel('posts-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'visibility=eq.public'
        },
        async (payload) => {
          // Fetch the full post with author info
          const { data: newPost, error } = await supabase
            .from('posts')
            .select(`
              *,
              profiles:author_id (
                full_name,
                avatar_url,
                id
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && newPost) {
            const postWithAuthor = {
              ...newPost,
              author: newPost.profiles as any
            };
            
            setPosts(current => [postWithAuthor, ...current]);
            
            // Show notification for new posts (except from current user)
            if (newPost.author_id !== user?.id) {
              toast.success(`New post from ${newPost.profiles?.full_name || 'Someone'}`, {
                duration: 3000,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(current => 
            current.map(post => 
              post.id === payload.new.id 
                ? { ...post, ...payload.new }
                : post
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          setPosts(current => 
            current.filter(post => post.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const addPost = (newPost: Post) => {
    setPosts(current => [newPost, ...current]);
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(current => 
      current.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  };

  const removePost = (postId: string) => {
    setPosts(current => current.filter(post => post.id !== postId));
  };

  return {
    posts,
    loading,
    addPost,
    updatePost,
    removePost,
    refetch: fetchPosts
  };
};
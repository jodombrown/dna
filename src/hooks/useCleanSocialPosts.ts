
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CleanSocialPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'text' | 'article' | 'event_share' | 'community_share' | 'contribution_card' | 'newsletter';
  media_urls?: string[];
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url?: string;
    profession?: string;
  };
}

export const useCleanSocialPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CleanSocialPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            profession
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedPosts: CleanSocialPost[] = data?.map(post => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        post_type: post.post_type as CleanSocialPost['post_type'],
        media_urls: post.media_urls,
        hashtags: post.hashtags,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        author: post.profiles ? {
          full_name: post.profiles.full_name || 'Unknown User',
          avatar_url: post.profiles.avatar_url || undefined,
          profession: post.profiles.profession || undefined
        } : undefined
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, postType: string = 'text') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          post_type: postType,
          hashtags: extractHashtags(content)
        })
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            profession
          )
        `)
        .single();

      if (error) throw error;

      const newPost: CleanSocialPost = {
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        post_type: data.post_type as CleanSocialPost['post_type'],
        media_urls: data.media_urls,
        hashtags: data.hashtags,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        shares_count: data.shares_count || 0,
        created_at: data.created_at,
        author: data.profiles ? {
          full_name: data.profiles.full_name || 'Unknown User',
          avatar_url: data.profiles.avatar_url || undefined,
          profession: data.profiles.profession || undefined
        } : undefined
      };

      setPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    refreshPosts: fetchPosts
  };
};

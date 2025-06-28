import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SocialPost {
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
    professional_role?: string;
  };
  shared_event?: any;
  shared_community?: any;
}

export const useSocialPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});

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
            professional_role
          ),
          events!posts_shared_event_id_fkey (
            id,
            title,
            description,
            date_time,
            location
          ),
          communities!posts_shared_community_id_fkey (
            id,
            name,
            description,
            category
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedPosts: SocialPost[] = data?.map(post => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        post_type: post.post_type as SocialPost['post_type'],
        media_urls: post.media_urls,
        hashtags: post.hashtags,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        author: (post.profiles && typeof post.profiles === 'object' && 'full_name' in post.profiles) ? {
          full_name: post.profiles.full_name || 'Unknown User',
          avatar_url: post.profiles.avatar_url,
          professional_role: post.profiles.professional_role
        } : undefined,
        shared_event: post.events,
        shared_community: post.communities
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

  const createPost = async (content: string, postType: string = 'text', additionalData?: any) => {
    if (!user) return;

    try {
      const postData = {
        user_id: user.id,
        content,
        post_type: postType,
        hashtags: extractHashtags(content),
        ...additionalData
      };

      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            professional_role
          )
        `)
        .single();

      if (error) throw error;

      const newPost: SocialPost = {
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        post_type: data.post_type as SocialPost['post_type'],
        media_urls: data.media_urls,
        hashtags: data.hashtags,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        shares_count: data.shares_count || 0,
        created_at: data.created_at,
        author: (data.profiles && typeof data.profiles === 'object' && 'full_name' in data.profiles) ? {
          full_name: data.profiles.full_name || 'Unknown User',
          avatar_url: data.profiles.avatar_url,
          professional_role: data.profiles.professional_role
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

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      const existingReaction = userReactions[postId];
      
      if (existingReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .match({ post_id: postId, user_id: user.id, reaction_type: reactionType });
        
        setUserReactions(prev => {
          const newReactions = { ...prev };
          delete newReactions[postId];
          return newReactions;
        });
      } else {
        // Add/update reaction
        await supabase
          .from('post_reactions')
          .upsert({ 
            post_id: postId, 
            user_id: user.id, 
            reaction_type: reactionType 
          });
        
        setUserReactions(prev => ({ ...prev, [postId]: reactionType }));
      }
      
      // Refresh posts to get updated counts
      fetchPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
      toast({
        title: "Error",
        description: "Failed to react to post",
        variant: "destructive",
      });
    }
  };

  const sharePost = async (postId: string, sharedContent?: string) => {
    if (!user) return;

    try {
      await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          shared_content: sharedContent
        });

      toast({
        title: "Success",
        description: "Post shared successfully!",
      });
      
      fetchPosts(); // Refresh to update share counts
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive",
      });
    }
  };

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  return {
    posts,
    loading,
    userReactions,
    createPost,
    reactToPost,
    sharePost,
    refreshPosts: fetchPosts
  };
};

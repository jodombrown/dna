
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SocialPost {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  post_type: string;
  media_urls?: string[];
  hashtags?: string[];
  is_published: boolean;
  user_name: string;
  user_avatar?: string;
  user_role?: string;
  author?: {
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
  };
}

export const useSocialPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo functionality - return sample posts
      const samplePosts: SocialPost[] = [
        {
          id: '1',
          content: 'Excited to connect with fellow diaspora professionals! 🌍 #DiasporaNetwork #DNACommunity',
          user_id: 'demo-user-1',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes_count: 12,
          comments_count: 3,
          shares_count: 2,
          post_type: 'text',
          hashtags: ['DiasporaNetwork', 'DNACommunity'],
          is_published: true,
          user_name: 'Amara Okafor',
          user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
          user_role: 'Tech Entrepreneur',
          author: {
            full_name: 'Amara Okafor',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
            professional_role: 'Tech Entrepreneur'
          }
        },
        {
          id: '2',
          content: 'Looking forward to collaborating on projects that impact Africa positively. Let\'s build together! 🚀',
          user_id: 'demo-user-2',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes_count: 8,
          comments_count: 5,
          shares_count: 1,
          post_type: 'text',
          hashtags: ['Collaboration', 'Africa'],
          is_published: true,
          user_name: 'Kwame Asante',
          user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          user_role: 'Social Impact Investor',
          author: {
            full_name: 'Kwame Asante',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            professional_role: 'Social Impact Investor'
          }
        }
      ];
      
      setPosts(samplePosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, postType: string = 'text') => {
    if (!user) return;
    
    try {
      toast({
        title: "Feature Coming Soon",
        description: "Post creation will be implemented in a future update",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    
    try {
      toast({
        title: "Feature Coming Soon",
        description: "Post interactions will be implemented in a future update",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) return;
    
    try {
      setUserReactions(prev => ({
        ...prev,
        [postId]: reactionType
      }));
      toast({
        title: "Feature Coming Soon",
        description: "Post reactions will be implemented in a future update",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to react to post');
    }
  };

  const sharePost = async (postId: string) => {
    if (!user) return;
    
    try {
      toast({
        title: "Feature Coming Soon",
        description: "Post sharing will be implemented in a future update",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share post');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    userReactions,
    fetchPosts,
    createPost,
    likePost,
    reactToPost,
    sharePost
  };
};

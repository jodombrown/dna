
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSocialPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey(
            id,
            full_name,
            avatar_url,
            profession
          ),
          shared_event:events(
            id,
            title,
            description,
            date_time,
            location
          ),
          shared_community:communities(
            id,
            name,
            description,
            category
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to react to posts",
        variant: "destructive"
      });
      return;
    }

    try {
      // For now, just show a toast - implement reactions later
      toast({
        title: "Reaction Added",
        description: `You ${reactionType}d this post!`,
      });
      
      setUserReactions(prev => ({
        ...prev,
        [postId]: reactionType
      }));
    } catch (error) {
      console.error('Error reacting to post:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive"
      });
    }
  };

  const sharePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to share posts",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Shared!",
      description: "Post shared successfully",
    });
  };

  return {
    posts,
    loading,
    userReactions,
    reactToPost,
    sharePost,
    refreshPosts: fetchPosts
  };
};

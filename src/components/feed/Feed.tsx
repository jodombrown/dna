import React, { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
  embed_metadata?: any;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    location?: string;
    professional_role?: string;
  };
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
}

interface FeedProps {
  pillar?: string;
  limit?: number;
}

export const Feed: React.FC<FeedProps> = ({ 
  pillar = 'feed', 
  limit = 10 
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
          embed_metadata,
          profiles!posts_author_id_fkey (
            id,
            full_name,
            avatar_url,
            location,
            professional_role
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by pillar if specified and not 'feed'
      if (pillar !== 'feed') {
        query = query.eq('pillar', pillar);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get post IDs for likes and comments count
      const postIds = postsData.map(post => post.id);

      // Fetch like counts
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);

      // Fetch comment counts
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);

      // Check user's likes if authenticated
      let userLikesData = [];
      if (user) {
        const { data } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        userLikesData = data || [];
      }

      // Combine data
      const postsWithEngagement = postsData.map(post => {
        const likeCount = likesData?.filter(like => like.post_id === post.id).length || 0;
        const commentCount = commentsData?.filter(comment => comment.post_id === post.id).length || 0;
        const userHasLiked = userLikesData.some(like => like.post_id === post.id);

        return {
          ...post,
          like_count: likeCount,
          comment_count: commentCount,
          user_has_liked: userHasLiked,
        };
      });

      setPosts(postsWithEngagement);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [pillar, user?.id]);

  const handleLike = (postId: string) => {
    // Optimistic update handled in PostCard
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment dialog or navigate to post detail
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Share post:', postId);
  };

  const handleRefresh = () => {
    fetchPosts(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading posts...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          {pillar === 'feed' 
            ? "No posts yet. Be the first to share something!" 
            : `No posts in the ${pillar} category yet.`
          }
        </p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          {pillar === 'feed' ? 'Latest Posts' : `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Posts`}
        </h3>
        <Button 
          onClick={handleRefresh} 
          variant="ghost" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))}
      </div>
    </div>
  );
};
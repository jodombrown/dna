import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedPostCard } from './EnhancedPostCard';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { useVirtualizer } from '@tanstack/react-virtual';

interface Post {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
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

interface SocialFeedProps {
  pillar?: string;
  limit?: number;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ 
  pillar = 'feed', 
  limit = 10 
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const parentRef = useRef<HTMLDivElement>(null);

  // Handle new posts from realtime - add to newPosts instead of directly to posts
  const handleNewPost = useCallback((newPost: any) => {
    // Only add posts that match the current pillar filter
    if (pillar === 'feed' || newPost.pillar === pillar) {
      setNewPosts(prevNewPosts => {
        // Check if post already exists to avoid duplicates
        const exists = prevNewPosts.some(post => post.id === newPost.id);
        if (exists) return prevNewPosts;
        
        // Add the new post at the beginning of newPosts
        return [newPost, ...prevNewPosts];
      });
    }
  }, [pillar]);

  // Merge new posts into main feed
  const mergeNewPosts = useCallback(() => {
    setPosts(prevPosts => [...newPosts, ...prevPosts]);
    setNewPosts([]);
  }, [newPosts]);

  // Set up realtime subscription with comprehensive feed monitoring
  const { connectionStatus } = useRealtimeFeed({
    pillar,
    onPostUpdate: (post, event) => {
      if (event === 'INSERT') {
        handleNewPost(post);
      }
    },
    onLikeUpdate: (like, event) => {
      // Update like counts in real time
      setPosts(prev => prev.map(post => {
        if (post.id === like.post_id) {
          const likeChange = event === 'INSERT' ? 1 : -1;
          const isUserLike = like.user_id === user?.id;
          return {
            ...post,
            like_count: Math.max(0, (post.like_count || 0) + likeChange),
            user_has_liked: isUserLike ? event === 'INSERT' : post.user_has_liked
          };
        }
        return post;
      }));
    },
    onCommentUpdate: (comment, event) => {
      // Update comment counts in real time
      if (event === 'INSERT') {
        setPosts(prev => prev.map(post => {
          if (post.id === comment.post_id) {
            return {
              ...post,
              comment_count: (post.comment_count || 0) + 1
            };
          }
          return post;
        }));
      }
    }
  });

  // Set up virtual scrolling
  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height per post card
    overscan: 5, // Render 5 items outside visible area for smooth scrolling
  });

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
          profiles:author_id (
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
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds);

      if (likesError) console.error('Error fetching likes:', likesError);

      // Fetch comment counts
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('post_id')
        .in('post_id', postIds);

      if (commentsError) console.error('Error fetching comments:', commentsError);

      // Check user's likes if authenticated
      let userLikesData = [];
      if (user) {
        const { data, error } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        if (error) console.error('Error fetching user likes:', error);
        else userLikesData = data || [];
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

  const handleLike = async (postId: string) => {
    // Optimistically update the UI
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          user_has_liked: !post.user_has_liked,
          like_count: post.user_has_liked 
            ? Math.max(0, (post.like_count || 0) - 1)
            : (post.like_count || 0) + 1
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string) => {
    // TODO: Open comment dialog or navigate to post detail
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    // Share functionality is handled in PostCard
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
        {connectionStatus === 'connected' && (
          <div className="ml-2 text-xs text-dna-emerald">• Live</div>
        )}
        {connectionStatus === 'error' && (
          <div className="ml-2 text-xs text-red-500">• Connection Error</div>
        )}
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
      {/* Refresh button */}
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

      {/* New posts notification */}
      {newPosts.length > 0 && (
        <Button
          onClick={mergeNewPosts}
          variant="outline"
          className="w-full mb-4 bg-dna-mint/20 border-dna-mint hover:bg-dna-mint/30 text-dna-forest animate-pulse"
        >
          {newPosts.length} New Post{newPosts.length > 1 ? 's' : ''} – Click to View
        </Button>
      )}

      {/* Virtualized Posts List */}
      <div 
        ref={parentRef} 
        className="overflow-y-auto h-[calc(100vh-280px)] scrollbar-thin"
        style={{ contain: 'strict' }}
      >
        <div 
          style={{ 
            height: `${rowVirtualizer.getTotalSize()}px`, 
            position: 'relative',
            width: '100%'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const post = posts[virtualRow.index];
            if (!post) return null;
            
            return (
              <div
                key={post.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pb-4">
                  <EnhancedPostCard
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
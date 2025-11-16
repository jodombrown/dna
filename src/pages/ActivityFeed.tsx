import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedHeader from '@/components/UnifiedHeader';
import { PostComposer } from '@/components/social-feed/PostComposer';
import { PostCard } from '@/components/feed/PostCard';
import { fetchPosts } from '@/services/postsService';
import type { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const ActivityFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  const loadPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    // Set up real-time subscriptions for posts, likes, and comments
    const channel = supabase
      .channel(`activity-feed-updates_${user.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Post change received:', payload);
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        (payload) => {
          console.log('Like change received:', payload);
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          console.log('Comment change received:', payload);
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePostCreated = () => {
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All Posts
          </Button>
          <Button
            onClick={() => setFilter('following')}
            variant={filter === 'following' ? 'default' : 'outline'}
            size="sm"
          >
            Following
          </Button>
        </div>

        {/* Post Composer */}
        <div className="mb-6">
          <PostComposer onPostCreated={handlePostCreated} />
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.post_id}
                post={{
                  id: post.post_id,
                  content: post.content,
                  created_at: post.created_at,
                  author_id: post.author_id,
                  updated_at: post.created_at,
                  post_type: post.post_type,
                  visibility: 'public',
                  is_pinned: false,
                  is_flagged: false,
                  media_urls: post.image_url ? [post.image_url] : null,
                  profiles: {
                    id: post.author_id,
                    full_name: post.author_full_name,
                    avatar_url: post.author_avatar_url,
                    location: '',
                    professional_role: post.author_headline || '',
                  },
                  like_count: Number(post.likes_count),
                  comment_count: Number(post.comments_count),
                  user_has_liked: post.user_has_liked,
                } as any}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

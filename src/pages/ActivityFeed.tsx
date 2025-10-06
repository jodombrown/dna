import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedHeader from '@/components/UnifiedHeader';
import { PostComposer } from '@/components/social-feed/PostComposer';
import { PostCard } from '@/components/feed/PostCard';
import { fetchPosts } from '@/services/postsService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  post_type: string;
  visibility: string;
  metadata: any;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    profession?: string;
    location?: string;
  };
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

const ActivityFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
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
      .channel('activity-feed-updates')
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
                key={post.id}
                post={{
                  id: post.id,
                  content: post.content,
                  created_at: post.created_at,
                  type: post.post_type,
                  pillar: post.metadata?.pillar || 'connect',
                  media_url: post.metadata?.media_url,
                  embed_metadata: post.metadata?.embed_metadata,
                  profiles: {
                    id: post.author.id,
                    full_name: post.author.full_name,
                    avatar_url: post.author.avatar_url,
                    location: post.author.location,
                    professional_role: post.author.profession,
                  },
                  like_count: post.likes_count,
                  comment_count: post.comments_count,
                  user_has_liked: post.user_has_liked,
                }}
                onLike={handlePostCreated}
                onComment={handlePostCreated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

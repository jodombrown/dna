import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedHeader from '@/components/UnifiedHeader';
import { PostComposer } from '@/components/social-feed/PostComposer';
import PostCard from '@/components/feed/PostCard';
import { fetchPosts } from '@/services/postsService';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

    // Set up real-time subscription
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Post change received:', payload);
          // Reload posts when changes occur
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePostCreated = () => {
    // Reload posts after new post created
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
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
                  user_id: post.author.id,
                  username: post.author.username,
                  full_name: post.author.full_name,
                  avatar_url: post.author.avatar_url,
                  profession: post.author.profession,
                  location: post.author.location,
                  likes_count: post.likes_count,
                  comments_count: post.comments_count,
                  user_has_liked: post.user_has_liked,
                  media_url: post.metadata?.media_url,
                  media_type: post.metadata?.media_type,
                  pillar: post.metadata?.pillar || 'connect',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

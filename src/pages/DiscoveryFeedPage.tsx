import { useState, useEffect } from 'react';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { Button } from '@/components/ui/button';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Globe, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DiscoveryFeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const { data: posts, refetch, isLoading, error } = useFeedPosts('all', user?.id);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('discovery_feed_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          console.log('Post change detected, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <FeedLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Discover</h1>
          </div>
          <p className="text-muted-foreground">
            Explore updates from the entire DNA community
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Public Discovery Feed</p>
            <p className="text-xs text-muted-foreground mt-1">
              See posts from all DNA members. Connect with interesting people to see their connection-only posts in your Network feed.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-6">
            <p className="font-semibold">Error loading posts</p>
            <p className="text-sm mt-1">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              Loading posts...
            </div>
          ) : posts && posts.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No public posts yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share something with the DNA community!
              </p>
              <Button
                onClick={() => navigate('/dna/network')}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
              >
                Go to Network Feed
              </Button>
            </div>
          ) : (
            posts?.map((post) => (
              <div key={post.post_id}>
                <PostCard
                  post={post}
                  currentUserId={user?.id || ''}
                  onUpdate={refetch}
                  onCommentClick={() => handleCommentClick(post.post_id)}
                />
                {expandedPostId === post.post_id && (
                  <PostComments postId={post.post_id} currentUserId={user?.id || ''} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </FeedLayout>
  );
}

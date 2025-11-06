import { useState, useEffect, useRef, useCallback } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfiniteFeedPosts } from '@/hooks/useInfiniteFeedPosts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PenSquare, Users, Sparkles, Image as ImageIcon, Video, FileText, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Profile } from '@/services/profilesService';

type FeedFilter = 'connections' | 'my_posts';

interface DashboardFeedColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export default function DashboardFeedColumn({ profile, isOwnProfile }: DashboardFeedColumnProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedFilter>('connections');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteFeedPosts(activeTab, user?.id);

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into a single posts array
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`network_feed_updates_${user.id}_${Date.now()}`) // Unique channel per mount
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Feed</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover what's happening in your network
          </p>
        </div>
        {isOwnProfile && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Start a post
          </Button>
        )}
      </div>

      {/* Quick Post Composer */}
      {isOwnProfile && (
        <Card className="p-4 mb-4">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="w-full text-left px-4 py-3 rounded-full border border-input bg-background hover:bg-accent transition-colors text-muted-foreground"
          >
            Start a post...
          </button>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="flex-1 gap-2"
            >
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Photo</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="flex-1 gap-2"
            >
              <Video className="h-5 w-5 text-green-500" />
              <span className="text-sm">Video</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="flex-1 gap-2"
            >
              <FileText className="h-5 w-5 text-orange-500" />
              <span className="text-sm">Document</span>
            </Button>
          </div>
        </Card>
      )}

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as FeedFilter)} 
      >
        <TabsList className="w-full">
          <TabsTrigger value="connections" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Network Updates
          </TabsTrigger>
          <TabsTrigger value="my_posts" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            My Posts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
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

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'my_posts'
                ? "You haven't posted anything yet"
                : 'No updates from your network'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'my_posts'
                ? 'Use the "Share" button above to create your first post'
                : "Your connections haven't posted yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
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
            ))}

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="py-8">
              {isFetchingNextPage && (
                <div className="text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading more posts...</p>
                </div>
              )}
              {!hasNextPage && posts.length > 0 && (
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">You've reached the end</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isOwnProfile && (
        <EnhancedCreatePostDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          currentUserId={user?.id || ''}
          onSuccess={() => {
            refetch();
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}

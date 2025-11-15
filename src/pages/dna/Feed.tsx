import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, PenSquare, Sparkles } from 'lucide-react';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { LoadMoreTrigger } from '@/components/social-feed/LoadMoreTrigger';
import { SkeletonPostCard } from '@/components/social-feed/SkeletonPostCard';
import { TrendingHashtags } from '@/components/feed/TrendingHashtags';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ActivityType } from '@/types/activity';
import { 
  FeedConnectionCard, 
  FeedSpaceCard, 
  FeedEventCard, 
  FeedContributionCard, 
  FeedStoryCard 
} from '@/components/feed/activity-cards';
import { supabase } from '@/integrations/supabase/client';

type FeedFilterType = 'all' | 'posts' | 'connections' | 'spaces-events' | 'contributions-stories';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [filterType, setFilterType] = useState<FeedFilterType>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Map filter type to activity types
  const getActivityTypes = (): ActivityType[] | undefined => {
    switch (filterType) {
      case 'posts':
        return ['post'];
      case 'connections':
        return ['connection'];
      case 'spaces-events':
        return ['space', 'event'];
      case 'contributions-stories':
        return ['contribution', 'story'];
      default:
        return undefined; // all
    }
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useActivityFeed({
    userId: user?.id,
    activityTypes: getActivityTypes(),
  });

  const activities = data?.pages.flatMap((page) => page.activities) || [];

  // Real-time updates for new activity
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-feed-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'convey_items' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Feed - Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Your DNA Feed
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Activity from across the network
              </p>
            </div>
          </div>

          {/* Create Post Trigger Card */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setShowCreateDialog(true)}
              >
                What's on your mind?
              </Button>
              <Button
                size="icon"
                onClick={() => setShowCreateDialog(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PenSquare className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Feed Type Filter */}
          <Tabs value={feedType} onValueChange={(v) => setFeedType(v as FeedType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="my_posts">My Posts</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonPostCard />
              <SkeletonPostCard />
              <SkeletonPostCard />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={post.post_id}>
                  <PostCard
                    post={post}
                    currentUserId={user.id}
                    onUpdate={refetch}
                    onCommentClick={() => handleCommentClick(post.post_id)}
                    showComments={expandedPostId === post.post_id}
                  />
                  {expandedPostId === post.post_id && (
                    <PostComments postId={post.post_id} currentUserId={user.id} />
                  )}
                </div>
              ))}

              {/* Infinite Scroll Trigger */}
              <LoadMoreTrigger
                onLoadMore={fetchNextPage}
                hasMore={hasNextPage || false}
                isLoading={isFetchingNextPage}
              />

              {/* Loading Indicator */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedHashtag
                  ? `No posts found with #${selectedHashtag}`
                  : feedType === 'connections' 
                  ? 'No posts from your connections yet. Start connecting with people!' 
                  : feedType === 'my_posts'
                  ? 'You haven\'t posted anything yet. Share your first post!'
                  : 'No posts yet. Be the first to share!'}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Trending */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <TrendingHashtags
            onHashtagClick={(tag) => {
              setSelectedHashtag(tag);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </aside>
      </div>
      
      {/* Enhanced Create Post Dialog */}
      <EnhancedCreatePostDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        currentUserId={user.id}
        onSuccess={() => {
          refetch();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};

export default DnaFeed;

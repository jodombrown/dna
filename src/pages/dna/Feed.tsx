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

          {/* Activity Type Filter */}
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FeedFilterType)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="spaces-events">Spaces & Events</TabsTrigger>
              <TabsTrigger value="contributions-stories">Contributions</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Activity Feed */}
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonPostCard />
              <SkeletonPostCard />
              <SkeletonPostCard />
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                switch (activity.activity_type) {
                  case 'post':
                    return (
                      <div key={activity.activity_id}>
                        <PostCard
                          post={{
                            post_id: activity.entity_id,
                            content: activity.entity_data?.content || '',
                            post_type: (activity.entity_data?.post_type || 'update') as any,
                            privacy_level: (activity.entity_data?.privacy_level || 'public') as any,
                            created_at: activity.created_at,
                            author_id: activity.actor_id,
                            author_username: activity.actor_username,
                            author_full_name: activity.actor_full_name,
                            author_avatar_url: activity.actor_avatar_url,
                            likes_count: activity.entity_data?.likes_count || 0,
                            comments_count: activity.entity_data?.comments_count || 0,
                            user_has_liked: activity.entity_data?.user_has_liked || false,
                            is_connection: activity.entity_data?.is_connection || false,
                          }}
                          currentUserId={user.id}
                          onUpdate={refetch}
                          onCommentClick={() => handleCommentClick(activity.entity_id)}
                          showComments={expandedPostId === activity.entity_id}
                        />
                        {expandedPostId === activity.entity_id && (
                          <PostComments postId={activity.entity_id} currentUserId={user.id} />
                        )}
                      </div>
                    );
                  case 'connection':
                    return <FeedConnectionCard key={activity.activity_id} activity={activity} />;
                  case 'space':
                    return <FeedSpaceCard key={activity.activity_id} activity={activity} />;
                  case 'event':
                    return <FeedEventCard key={activity.activity_id} activity={activity} />;
                  case 'contribution':
                    return <FeedContributionCard key={activity.activity_id} activity={activity} />;
                  case 'story':
                    return <FeedStoryCard key={activity.activity_id} activity={activity} />;
                  default:
                    return null;
                }
              })}

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
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                {filterType === 'posts' 
                  ? 'No posts yet. Be the first to share!' 
                  : filterType === 'connections'
                  ? 'No connection activity yet. Start connecting with people!' 
                  : filterType === 'spaces-events'
                  ? 'No space or event activity yet. Join a space or create an event!'
                  : filterType === 'contributions-stories'
                  ? 'No contributions or stories yet. Make your first contribution!'
                  : 'No activity yet. Start by sharing a post or connecting with others!'}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Placeholder for future features */}
        <aside className="hidden lg:block lg:col-span-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Trending topics, suggested connections, and more will appear here.
            </p>
          </Card>
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

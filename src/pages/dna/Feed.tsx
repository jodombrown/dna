import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Sparkles, Users } from 'lucide-react';
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
import { ProfileStrengthBanner } from '@/components/shared/ProfileStrengthBanner';
import LayoutController from '@/components/LayoutController';

type FeedFilterType = 'all' | 'posts' | 'connections' | 'spaces-events' | 'contributions-stories';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
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

  // Left Column: Navigation placeholder
  const leftColumn = (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Quick Nav</h3>
        <div className="space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dna/connect')}>
            <Users className="w-4 h-4 mr-2" />
            Network
          </Button>
        </div>
      </Card>
    </div>
  );

  // Center Column: Main Feed
  const centerColumn = (
    <div className="space-y-4">
      <ProfileStrengthBanner userId={user.id} />
      
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Your DNA Feed
          </h1>
          <p className="text-muted-foreground text-sm">Activity from across the network</p>
        </div>
      </div>

      {/* Create Post Card */}
      <Card 
        className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setShowCreateDialog(true)}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted rounded-full px-4 py-2 text-muted-foreground">
            What's on your mind?
          </div>
          <Button size="icon" variant="ghost">
            <PenSquare className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FeedFilterType)}>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="spaces-events">Spaces & Events</TabsTrigger>
          <TabsTrigger value="contributions-stories">Contributions</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonPostCard key={i} />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Your Feed Will Light Up Soon!</h3>
          <p className="text-muted-foreground mb-6">
            Your feed will come alive as you connect with others, join spaces, RSVP to events, and engage with the community.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={() => navigate('/dna/connect')}>
              <Users className="w-4 h-4 mr-2" />
              Discover Members
            </Button>
            <Button variant="outline" onClick={() => navigate('/dna/collaborate/spaces')}>
              Explore Spaces
            </Button>
            <Button variant="outline" onClick={() => navigate('/dna/convene/events')}>
              Browse Events
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            switch (activity.activity_type) {
              case 'post':
                return (
                  <div key={activity.id}>
                    <PostCard
                      post={activity.post!}
                      onCommentClick={() => handleCommentClick(activity.post!.id)}
                    />
                    {expandedPostId === activity.post!.id && (
                      <PostComments postId={activity.post!.id} />
                    )}
                  </div>
                );
              case 'connection':
                return <FeedConnectionCard key={activity.id} activity={activity} />;
              case 'space':
                return <FeedSpaceCard key={activity.id} activity={activity} />;
              case 'event':
                return <FeedEventCard key={activity.id} activity={activity} />;
              case 'contribution':
                return <FeedContributionCard key={activity.id} activity={activity} />;
              case 'story':
                return <FeedStoryCard key={activity.id} activity={activity} />;
              default:
                return null;
            }
          })}

          {hasNextPage && (
            <LoadMoreTrigger
              onLoadMore={fetchNextPage}
              isLoading={isFetchingNextPage}
            />
          )}
        </div>
      )}

      <EnhancedCreatePostDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );

  // Right Column: Widgets
  const rightColumn = (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          Trending topics, suggested connections, and more will appear here.
        </p>
      </Card>
      <TrendingHashtags />
    </div>
  );

  return (
    <LayoutController
      leftColumn={leftColumn}
      centerColumn={centerColumn}
      rightColumn={rightColumn}
    />
  );
};

export default DnaFeed;

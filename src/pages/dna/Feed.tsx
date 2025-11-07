import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, PenSquare } from 'lucide-react';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { useInfiniteFeedPosts } from '@/hooks/useInfiniteFeedPosts';
import { LoadMoreTrigger } from '@/components/social-feed/LoadMoreTrigger';
import { SkeletonPostCard } from '@/components/social-feed/SkeletonPostCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type FeedType = 'all' | 'connections' | 'my_posts';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteFeedPosts(feedType, user?.id);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

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
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
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
          {posts.map((post) => (
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
            {feedType === 'connections' 
              ? 'No posts from your connections yet. Start connecting with people!' 
              : feedType === 'my_posts'
              ? 'You haven\'t posted anything yet. Share your first post!'
              : 'No posts yet. Be the first to share!'}
          </p>
        </div>
      )}
      
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

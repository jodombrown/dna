import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { useInfiniteFeedPosts } from '@/hooks/useInfiniteFeedPosts';
import { LoadMoreTrigger } from '@/components/social-feed/LoadMoreTrigger';
import { SkeletonPostCard } from '@/components/social-feed/SkeletonPostCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FeedType = 'all' | 'connections' | 'my_posts';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [feedType, setFeedType] = useState<FeedType>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

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
      <CreatePost />

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
    </div>
  );
};

export default DnaFeed;

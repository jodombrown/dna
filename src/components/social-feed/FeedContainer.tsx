import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FloatingPostComposer } from './FloatingPostComposer';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
import { PillarFilter } from './PillarFilter';
import { PostList, type Post } from './PostList';
import { EditPostModal } from './EditPostModal';
import { usePaginatedPosts } from './usePaginatedPosts';
import { useFeedRealtime } from './useFeedRealtime';
import { RealtimeStatus } from './RealtimeStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FeedContainerProps {
  defaultPillar?: string;
  showComposer?: boolean;
}

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Alert variant="destructive" className="m-4">
    <AlertDescription className="flex items-center justify-between">
      <span>Something went wrong loading the feed.</span>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </AlertDescription>
  </Alert>
);

const FeedContainerInner: React.FC<FeedContainerProps> = ({ 
  defaultPillar = 'feed',
  showComposer = true 
}) => {
  const [selectedPillar, setSelectedPillar] = useState(defaultPillar);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  const {
    posts,
    loading,
    hasMore,
    loadMore,
    refresh
  } = usePaginatedPosts({
    pillar: selectedPillar === 'feed' ? undefined : selectedPillar,
    refreshKey,
    relevantOnly: true,
  });

  const realtimeStatus = useFeedRealtime({
    onNewPost: (newPost) => {
      console.log('New post received, refreshing feed...', newPost);
      // Refresh on new posts to maintain order and get complete data
      refresh();
    },
    onPostUpdate: (postId, updates) => {
      console.log('Post updated:', postId, updates);
      // Individual post updates will be handled by PostCard optimistic updates
    },
    onPostDelete: (postId) => {
      console.log('Post deleted:', postId);
      refresh();
    },
    onNewComment: (comment) => {
      console.log('New comment received:', comment);
      // Comment count updates will be handled by the PostCard components
    }
  });

  const handlePostCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
  }, []);

  const handleDeletePost = useCallback((postId: string) => {
    // The delete will be handled by PostActions, here we just refresh
    refresh();
  }, [refresh]);

  const handlePostUpdated = useCallback(() => {
    setEditingPost(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handlePillarChange = useCallback((pillar: string) => {
    setSelectedPillar(pillar);
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6" role="main" aria-label="Social Feed">
      {showComposer && (
        <RequireProfileScore min={50} featureName="creating posts">
          <FloatingPostComposer 
            defaultPillar={selectedPillar === 'feed' ? 'connect' : selectedPillar}
            onPostCreated={handlePostCreated}
          />
        </RequireProfileScore>
      )}
      
      <div className="flex items-center justify-between">
        <PillarFilter
          selectedPillar={selectedPillar}
          onPillarChange={handlePillarChange}
        />
        <RealtimeStatus />
      </div>
      
      <PostList
        posts={posts}
        isLoading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRefresh={handleRefresh}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        emptyMessage={
          selectedPillar === 'feed' 
            ? "No posts yet. Be the first to share something!" 
            : `No posts in the ${selectedPillar} category yet.`
        }
      />

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export const FeedContainer: React.FC<FeedContainerProps> = (props) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => window.location.reload()}
  >
    <FeedContainerInner {...props} />
  </ErrorBoundary>
);
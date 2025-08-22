import React, { useState, useCallback, useEffect } from 'react';
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
import FeedModeTabs from './FeedModeTabs';
import { supabase } from '@/integrations/supabase/client';
import FloatingFeedbackWidget from '@/components/feedback/FloatingFeedbackWidget';
import { useAuth } from '@/contexts/AuthContext';

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
  const [feedMode, setFeedMode] = useState<'relevant' | 'trending' | 'spotlight'>('relevant');
  const { user } = useAuth();
  
  const {
    posts,
    loading,
    hasMore,
    loadMore,
    refresh
  } = usePaginatedPosts({
    pillar: selectedPillar === 'feed' ? undefined : selectedPillar,
    refreshKey,
    relevantOnly: feedMode === 'relevant',
    sortMode: feedMode,
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

  // Analytics: track feed mode and pillar changes
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        await supabase.rpc('log_engagement_event', {
          target_user_id: user.id,
          event_type_param: 'feed_mode_select',
          event_context_param: { mode: feedMode, pillar: selectedPillar },
        });
      } catch {}
    })();
  }, [feedMode]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        await supabase.rpc('log_engagement_event', {
          target_user_id: user.id,
          event_type_param: 'pillar_filter_select',
          event_context_param: { pillar: selectedPillar, mode: feedMode },
        });
      } catch {}
    })();
  }, [selectedPillar]);

  return (
    <div className="space-y-6" role="main" aria-label="Social Feed">
      {showComposer && (
        <RequireProfileScore min={50} featureName="creating posts" showToast showModal={false}>
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
        <div className="flex items-center gap-3">
          <FeedModeTabs mode={feedMode} onChange={setFeedMode} />
          <RealtimeStatus />
        </div>
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

      <FloatingFeedbackWidget pageType={(['connect','collaborate','contribute'] as const).includes(selectedPillar as any) ? (selectedPillar as any) : 'connect'} />
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
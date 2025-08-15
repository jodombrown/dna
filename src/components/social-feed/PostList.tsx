import React from 'react';
import { PostCard } from './PostCard';
import { LoadMoreTrigger } from './LoadMoreTrigger';
import { SkeletonPostCard } from './SkeletonPostCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PostListSkeleton } from '@/components/ui/loading-skeleton';
import { Loader2, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';

export interface Post {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
  author_id: string;
  embed_metadata?: any;
  profiles: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    location?: string;
    professional_role?: string;
  };
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
  user_has_saved?: boolean;
}

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  emptyMessage?: string;
  error?: string | null;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onEdit,
  onDelete,
  emptyMessage = "No posts yet.",
  error = null
}) => {
  // Error State
  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load posts"
        description={error}
        action={onRefresh ? {
          label: "Try again",
          onClick: onRefresh
        } : undefined}
      />
    );
  }

  // Loading State (initial load)
  if (isLoading && posts.length === 0) {
    return <PostListSkeleton count={5} />;
  }

  // Empty State
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No posts found"
        description={emptyMessage}
        action={onRefresh ? {
          label: "Refresh",
          onClick: onRefresh
        } : undefined}
      />
    );
  }

  return (
    <div className="space-y-4" role="feed" aria-label="Posts feed">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Latest Posts</h3>
        {onRefresh && (
          <Button 
            onClick={onRefresh} 
            variant="ghost" 
            size="sm"
            aria-label="Refresh posts"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        
        {/* Loading skeletons while fetching more posts */}
        {isLoading && posts.length > 0 && (
          <PostListSkeleton count={3} />
        )}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && onLoadMore && (
        <LoadMoreTrigger 
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      )}
      
      {/* End of feed indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">You've reached the end of the feed</p>
        </div>
      )}
    </div>
  );
};
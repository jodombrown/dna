import React from 'react';
import { PostCard } from './PostCard';
import { LoadMoreTrigger } from './LoadMoreTrigger';
import { SkeletonPostCard } from './SkeletonPostCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export interface Post {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
  author_id: string;
  shared_post_id?: string;
  shared_post?: Post;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    location?: string;
    professional_role?: string;
  };
  like_count?: number;
  comment_count?: number;
  user_has_liked?: boolean;
}

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onComment?: (postId: string) => void;
  emptyMessage?: string;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onComment,
  emptyMessage = "No posts yet."
}) => {
  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8" role="status" aria-label="Loading posts">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading posts...</span>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
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
            onComment={onComment}
            onPostUpdated={onRefresh}
            onPostDeleted={onRefresh}
            onRepostCreated={onRefresh}
          />
        ))}
        
        {/* Loading skeletons while fetching more posts */}
        {isLoading && posts.length > 0 && (
          <>
            <SkeletonPostCard />
            <SkeletonPostCard />
            <SkeletonPostCard />
          </>
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
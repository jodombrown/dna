import { useState, useEffect, useRef } from 'react';
import { useUniversalFeed, FeedType } from '@/hooks/useUniversalFeed';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Newspaper, Users as UsersIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UniversalFeedProps {
  /** Show feed tabs (All/Network/My Posts) - default true for home feed */
  showTabs?: boolean;
  /** Override feed type filter */
  feedType?: FeedType;
  /** Filter by author (for profile feeds) */
  authorId?: string;
  /** Filter by space (for space feeds) */
  spaceId?: string;
  /** Filter by event (for event feeds) */
  eventId?: string;
  /** Filter by hashtag */
  hashtag?: string | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when feed updates */
  onUpdate?: () => void;
}

/**
 * UniversalFeed - The canonical DNA feed component
 * 
 * Powers all feed surfaces across DNA:
 * - Home feed with tabs (All/Network/My Posts)
 * - Profile activity feeds
 * - Space feeds
 * - Event feeds
 * 
 * All content types flow through this component.
 */
export function UniversalFeed({
  showTabs = true,
  feedType: propFeedType,
  authorId,
  spaceId,
  eventId,
  hashtag,
  emptyMessage,
  onUpdate,
}: UniversalFeedProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedType>(propFeedType || 'all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use controlled feedType if provided, otherwise use tab state
  const effectiveFeedType = propFeedType || activeTab;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useUniversalFeed(user?.id, {
    feedType: effectiveFeedType,
    authorId,
    spaceId,
    eventId,
    hashtag,
  });
  // Keep latest callbacks in refs to avoid re-subscribing
  const refetchRef = useRef(refetch);
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Realtime: guard against double subscriptions
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    // Cleanup any existing channel before creating a new one
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (e) {
        console.warn('[UniversalFeed] removeChannel error', e);
      }
      channelRef.current = null;
      subscribedRef.current = false;
    }

    const ch = supabase.channel(`universal_feed:${user.id}`);

    ch
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        refetchRef.current?.();
        onUpdateRef.current?.();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' }, () => {
        refetchRef.current?.();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, () => {
        refetchRef.current?.();
      });

    channelRef.current = ch;

    if (!subscribedRef.current) {
      ch.subscribe((status) => {
        console.log('[UniversalFeed] channel status:', status);
      });
      subscribedRef.current = true;
    }

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (e) {
          console.warn('[UniversalFeed] removeChannel error', e);
        }
        channelRef.current = null;
        subscribedRef.current = false;
      }
    };
  }, [user?.id]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="w-full">
      {/* Tabs - only show if enabled and no specific filters */}
      {showTabs && !authorId && !spaceId && !eventId && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedType)} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              <Newspaper className="h-4 w-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger value="network" className="flex-1">
              <UsersIcon className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger value="my_posts" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              My Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Feed content */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading feed...</p>
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              {emptyMessage || 
                (effectiveFeedType === 'my_posts'
                  ? "You haven't posted anything yet"
                  : effectiveFeedType === 'network'
                  ? "Your network hasn't posted yet"
                  : 'Be the first to share something!')}
            </p>
          </div>
        ) : (
          <>
            {allPosts.map((post) => (
              <div key={post.post_id}>
                <PostCard
                  post={post}
                  currentUserId={user?.id || ''}
                  onUpdate={refetch}
                  onCommentClick={() => handleCommentClick(post.post_id)}
                  showComments={expandedPostId === post.post_id}
                />
                {expandedPostId === post.post_id && (
                  <PostComments postId={post.post_id} currentUserId={user?.id || ''} />
                )}
              </div>
            ))}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-8 text-center">
              {isFetchingNextPage && (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

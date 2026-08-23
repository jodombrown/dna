/**
 * Centralized React Query Configuration
 *
 * This file provides a shared QueryClient configuration for the entire application.
 * All query and mutation defaults are defined here for consistency.
 */

import { QueryClient } from '@tanstack/react-query';
import { handleQueryError } from './errorLogger';

/**
 * Default stale times for different query types (in milliseconds)
 * PERFORMANCE: Increased default times to reduce unnecessary refetches
 */
export const STALE_TIMES = {
  /** User profile data - relatively stable */
  profile: 10 * 60 * 1000, // 10 minutes (increased from 5)
  /** Feed data - changes frequently but doesn't need to be instant */
  feed: 2 * 60 * 1000, // 2 minutes (increased from 1)
  /** Static data like countries, languages */
  static: 60 * 60 * 1000, // 60 minutes (increased from 30)
  /** Real-time data like messages, notifications - use realtime subscriptions instead */
  realtime: 60 * 1000, // 1 minute (increased from 30s)
  /** Default for most queries */
  default: 5 * 60 * 1000, // 5 minutes (increased from 2)
} as const;

/**
 * Query key factories for consistent cache key generation
 *
 * DERIVED COUNTS (BD651 step 1). Every key under a `counts` namespace is a
 * number computed from rows the user never edits directly — a badge, a stat
 * strip, a follower tally. They are the keys most likely to go stale silently,
 * because nothing on screen looks broken when they do: a wrong number wears a
 * right label.
 *
 * Two rules make that failure impossible to reintroduce:
 *
 * 1. A counts key is ALWAYS a prefix-extension of its entity's `all` key, so
 *    `invalidateQueries({ queryKey: queryKeys.posts.all })` reaches every
 *    derived number under `posts` — including ones added after the mutation
 *    site was written. Mutation sites should invalidate the parent namespace,
 *    not enumerate leaves.
 * 2. Adding a derived count means adding it HERE, never as a string literal at
 *    the call site. A hand-written key cannot be found by the parent
 *    invalidation, which is exactly how a count goes stale and still certifies
 *    clean.
 *
 * CAUTION on `messages.all`: `['messages', conversationId]` is a live,
 * hand-written key for the message list in a thread, so `messages.all` is a
 * coarse prefix that would refetch every open conversation. Invalidate
 * `messages.counts.all` when you mean the unread badge.
 */
export const queryKeys = {
  // Profile queries
  profile: {
    all: ['profiles'] as const,
    detail: (id: string) => ['profile', id] as const,
    current: (id: string) => ['profile', 'current', id] as const,
    counts: {
      all: ['profiles', 'counts'] as const,
      /** follower_count / following_count for one profile, maintained by the
          sync_follow_counts DB trigger and read back by useFollow. */
      follow: (userId: string | undefined) => ['profiles', 'counts', 'follow', userId] as const,
    },
  },
  // Feed queries
  feed: {
    all: ['feed'] as const,
    universal: (filters: Record<string, unknown>) => ['universal-feed', filters] as const,
    personalized: (userId: string) => ['personalized-feed', userId] as const,
  },
  // Post queries
  posts: {
    all: ['posts'] as const,
    detail: (id: string) => ['post', id] as const,
    likes: (id: string) => ['post-likes', id] as const,
    reactions: (id: string) => ['post-reactions', id] as const,
    bookmarks: (userId: string) => ['post-bookmarks', userId] as const,
    counts: {
      all: ['posts', 'counts'] as const,
      /** The viewer's own Five C's tallies in FeedLeftPanel: connections,
          events, spaces and posts. Lives under `posts` because posts are the
          only one of the four that the feed's create/delete mutations move. */
      fiveC: (userId: string | undefined) => ['posts', 'counts', 'five-c', userId] as const,
      /** Platform-wide activity in FeedHeroGreeting. Not user-scoped. */
      platformPulse: ['posts', 'counts', 'platform-pulse'] as const,
    },
  },
  // Message queries
  messages: {
    all: ['messages'] as const,
    conversations: ['conversations'] as const,
    thread: (id: string) => ['messages', 'thread', id] as const,
    counts: {
      all: ['messages', 'counts'] as const,
      /** Unread message badge. Omit userId to invalidate every viewer's badge. */
      unread: (userId: string | undefined) => ['messages', 'counts', 'unread', userId] as const,
    },
  },
  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    counts: {
      all: ['notifications', 'counts'] as const,
      /** Unread notification badge, RPC-backed. */
      unread: (userId: string | undefined) => ['notifications', 'counts', 'unread', userId] as const,
    },
  },
  // Connection queries
  connections: {
    all: ['connections'] as const,
    requests: ['connection-requests'] as const,
    recommendations: ['connection-recommendations'] as const,
  },
  // Event queries
  events: {
    all: ['events'] as const,
    detail: (id: string) => ['event', id] as const,
    rsvp: (eventId: string, userId: string) => ['event-rsvp', eventId, userId] as const,
  },
  // Hashtag queries
  hashtags: {
    trending: ['trending-hashtags'] as const,
    detail: (name: string) => ['hashtag', name] as const,
    owned: (userId: string) => ['owned-hashtags', userId] as const,
  },
} as const;

/**
 * Create the QueryClient with centralized configuration
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIMES.default,
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        onError: (error) => {
          handleQueryError(error, 'mutation');
        },
      },
    },
  });
}

/**
 * Singleton instance for use throughout the app
 */
export const queryClient = createQueryClient();

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
 */
export const STALE_TIMES = {
  /** User profile data - relatively stable */
  profile: 5 * 60 * 1000, // 5 minutes
  /** Feed data - changes frequently */
  feed: 1 * 60 * 1000, // 1 minute
  /** Static data like countries, languages */
  static: 30 * 60 * 1000, // 30 minutes
  /** Real-time data like messages, notifications */
  realtime: 30 * 1000, // 30 seconds
  /** Default for most queries */
  default: 2 * 60 * 1000, // 2 minutes
} as const;

/**
 * Query key factories for consistent cache key generation
 */
export const queryKeys = {
  // Profile queries
  profile: {
    all: ['profiles'] as const,
    detail: (id: string) => ['profile', id] as const,
    current: (id: string) => ['profile', 'current', id] as const,
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
  },
  // Message queries
  messages: {
    all: ['messages'] as const,
    conversations: ['conversations'] as const,
    thread: (id: string) => ['messages', 'thread', id] as const,
    unread: ['unread-count'] as const,
  },
  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
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

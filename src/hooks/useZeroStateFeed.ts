/**
 * useZeroStateFeed - Zero State Discovery Feed for New Users
 *
 * Fetches curated content for new users who haven't yet built up
 * their own activity (connections, posts, events, etc.).
 *
 * Shows:
 * - Trending stories from the community
 * - Upcoming events
 * - Suggested connections (personalized)
 * - Popular collaboration spaces
 * - Marketplace opportunities matching skills
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import type { ZeroStateFeed } from '@/types/zero-state';
import { STALE_TIMES } from '@/lib/queryClient';

/**
 * Hook to fetch zero state discovery feed for new users
 */
export function useZeroStateFeed() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['zero-state-feed', user?.id],
    queryFn: async (): Promise<ZeroStateFeed> => {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase.rpc('get_zero_state_feed', {
        p_user_id: user.id,
        p_user_country: profile?.country_of_origin || null,
        p_user_industry: profile?.industry || null,
        p_user_skills: profile?.skills || [],
        p_user_focus_areas: profile?.focus_areas || [],
      });

      if (error) {
        console.error('Error fetching zero state feed:', error);
        throw error;
      }

      // Ensure we have valid data with defaults
      return {
        user_action_count: data?.user_action_count ?? 0,
        show_welcome_card: data?.show_welcome_card ?? true,
        show_discovery_feed: data?.show_discovery_feed ?? true,
        trending_stories: data?.trending_stories ?? [],
        upcoming_events: data?.upcoming_events ?? [],
        suggested_connections: data?.suggested_connections ?? [],
        popular_spaces: data?.popular_spaces ?? [],
        marketplace_highlights: data?.marketplace_highlights ?? [],
        generated_at: data?.generated_at ?? new Date().toISOString(),
      };
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.feed, // 1 minute - content updates regularly
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

/**
 * Hook to check if user should see zero state experience
 */
export function useIsZeroStateUser() {
  const { data: feed, isLoading } = useZeroStateFeed();

  return {
    isZeroState: feed?.show_discovery_feed ?? false,
    showWelcomeCard: feed?.show_welcome_card ?? false,
    actionCount: feed?.user_action_count ?? 0,
    isLoading,
  };
}

/**
 * Hook for fetching a space's communication channel.
 *
 * Uses messagingPrdService.getSpaceChannel to look up the conversation
 * linked to a space. Only fetches when `enabled` is true (i.e. the user
 * is a member or the space owner).
 *
 * Participant count is fetched via a SECURITY DEFINER RPC to bypass
 * conversation_participants RLS (which restricts SELECT to own rows).
 */

import { useQuery } from '@tanstack/react-query';
import { messagingPrdService } from '@/services/messagingPrdService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { STALE_TIMES } from '@/lib/queryClient';

const LOG_TAG = 'useSpaceChannel';

interface UseSpaceChannelReturn {
  channelId: string | null;
  participantCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useSpaceChannel(spaceId: string, enabled: boolean): UseSpaceChannelReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['space-channel', spaceId],
    queryFn: async () => {
      const channel = await messagingPrdService.getSpaceChannel(spaceId);
      if (!channel?.id) return { channelId: null, participantCount: 0 };

      // Fetch real count via SECURITY DEFINER RPC
      const { data: count, error: countError } = await (supabase as unknown as { rpc: (fn: string, params: Record<string, string>) => Promise<{ data: number | null; error: { message: string } | null }> })
        .rpc('get_thread_participant_count', { p_conversation_id: channel.id });

      if (countError) {
        logger.error(LOG_TAG, `Failed to fetch participant count for channel ${channel.id}`, countError);
      }

      return {
        channelId: channel.id,
        participantCount: (count as number) ?? 0,
      };
    },
    enabled: !!spaceId && enabled,
    staleTime: STALE_TIMES.default,
    retry: 1,
  });

  if (error) {
    logger.error(LOG_TAG, `Failed to fetch space channel for ${spaceId}`, error);
  }

  return {
    channelId: data?.channelId ?? null,
    participantCount: data?.participantCount ?? 0,
    isLoading,
    error: error as Error | null,
  };
}

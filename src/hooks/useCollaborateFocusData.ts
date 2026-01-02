/**
 * useCollaborateFocusData - Data Hook for Collaborate Focus Panel
 *
 * Fetches and manages data for the Collaborate Focus panel including:
 * - Spaces needing attention (stalled tasks)
 * - Active user spaces
 * - Space invitations
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { STALE_TIMES } from '@/lib/queryClient';

export interface Space {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  activeTaskCount: number;
  lastActivityAt: string;
  isStalled: boolean;
  role: string;
}

export interface SpaceInvite {
  id: string;
  spaceId: string;
  spaceName: string;
  invitedBy: string;
  invitedByName: string;
  invitedByAvatar: string | null;
  message: string | null;
  createdAt: string;
}

export function useCollaborateFocusData() {
  const { user } = useAuth();

  // Fetch user's active spaces
  const spacesQuery = useQuery({
    queryKey: ['collaborateFocus', 'spaces', user?.id],
    queryFn: async (): Promise<Space[]> => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      const { data: memberSpaces } = await supabase
        .from('space_members')
        .select(`
          space_id,
          role,
          spaces!inner (
            id,
            name,
            description,
            status,
            updated_at
          )
        `)
        .eq('user_id', user?.id)
        .eq('spaces.status', 'active')
        .order('spaces(updated_at)', { ascending: false })
        .limit(10);

      // Get member counts for each space
      const spaceIds = (memberSpaces || []).map((m: any) => m.space_id);
      const { data: memberCounts } = await supabase
        .from('space_members')
        .select('space_id')
        .in('space_id', spaceIds);

      const countMap = new Map<string, number>();
      (memberCounts || []).forEach((m: any) => {
        countMap.set(m.space_id, (countMap.get(m.space_id) || 0) + 1);
      });

      return (memberSpaces || []).map((m: any) => {
        const isStalled = m.spaces?.updated_at && m.spaces.updated_at < twoWeeksAgo;
        return {
          id: m.spaces.id,
          name: m.spaces.name,
          description: m.spaces.description,
          memberCount: countMap.get(m.space_id) || 1,
          activeTaskCount: 0, // TODO: Add task count when available
          lastActivityAt: m.spaces.updated_at,
          isStalled,
          role: m.role,
        };
      });
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Fetch space invitations
  const invitesQuery = useQuery({
    queryKey: ['collaborateFocus', 'invites', user?.id],
    queryFn: async (): Promise<SpaceInvite[]> => {
      const { data } = await supabase
        .from('space_invites')
        .select(`
          id,
          space_id,
          message,
          created_at,
          spaces!inner (
            id,
            name
          ),
          inviter:profiles!space_invites_invited_by_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('invitee_id', user?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      return (data || []).map((invite: any) => ({
        id: invite.id,
        spaceId: invite.space_id,
        spaceName: invite.spaces?.name || 'Unknown Space',
        invitedBy: invite.inviter?.id,
        invitedByName: invite.inviter?.full_name || 'Someone',
        invitedByAvatar: invite.inviter?.avatar_url,
        message: invite.message,
        createdAt: invite.created_at,
      }));
    },
    enabled: !!user?.id,
    staleTime: STALE_TIMES.realtime,
  });

  // Separate stalled and active spaces
  const allSpaces = spacesQuery.data || [];
  const stalledSpaces = allSpaces.filter(s => s.isStalled);
  const activeSpaces = allSpaces.filter(s => !s.isStalled);

  return {
    activeSpaces,
    stalledSpaces,
    spaceInvites: invitesQuery.data || [],
    isLoading: spacesQuery.isLoading,
    totalSpaces: allSpaces.length,
    stalledCount: stalledSpaces.length,
    inviteCount: invitesQuery.data?.length || 0,
    refetch: () => {
      spacesQuery.refetch();
      invitesQuery.refetch();
    },
  };
}

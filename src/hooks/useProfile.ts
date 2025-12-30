import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { profilesService } from '@/services/profilesService';

interface ProfileChannelEntry {
  channel: RealtimeChannel;
  refs: number;
}

const profileChannelRegistry = new Map<string, ProfileChannelEntry>();

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;

    let entry = profileChannelRegistry.get(uid);
    if (!entry) {
      const channel = supabase
        .channel(`realtime:profiles:self:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, () => {
          queryClient.invalidateQueries({ queryKey: ['profile', uid] });
        })
        .subscribe();

      entry = { channel, refs: 0 };
      profileChannelRegistry.set(uid, entry);
    }

    entry.refs += 1;

    return () => {
      const e = profileChannelRegistry.get(uid);
      if (e) {
        e.refs -= 1;
        if (e.refs <= 0) {
          supabase.removeChannel(e.channel);
          profileChannelRegistry.delete(uid);
        }
      }
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const data = await profilesService.getCurrentUserProfile(user.id);
        return data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
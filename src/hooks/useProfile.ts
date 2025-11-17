import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { profilesService } from '@/services/profilesService';

const profileChannelRegistry = new Map<string, { channel: any; refs: number }>();

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
    queryFn: () => profilesService.getCurrentUserProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};
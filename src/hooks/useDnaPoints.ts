import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDnaPoints = (userId?: string) => {
  return useQuery({
    queryKey: ['dna-points', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_dna_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        connect_score: 0,
        collaborate_score: 0,
        contribute_score: 0,
        total_score: 0
      };
    },
    enabled: !!userId
  });
};

export const useUserBadges = (userId?: string) => {
  return useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};

export const useLeaderboard = (type = 'total', country?: string, sector?: string) => {
  return useQuery({
    queryKey: ['leaderboard', type, country, sector],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        board_type: type,
        country_filter: country,
        sector_filter: sector,
        limit_count: 50
      });

      if (error) throw error;
      return data || [];
    }
  });
};
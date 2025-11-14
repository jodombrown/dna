import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';

interface ContributeStats {
  open_needs: number;
  offers_last_90_days: number;
  validated_contributions: number;
}

export function useSpaceContributeStats(spaceId: string | undefined) {
  return useQuery({
    queryKey: ['space-contribute-stats', spaceId],
    queryFn: async () => {
      if (!spaceId) return null;

      // Get open needs count
      const { count: openNeedsCount } = await supabaseClient
        .from('contribution_needs')
        .select('*', { count: 'exact', head: true })
        .eq('space_id', spaceId)
        .in('status', ['open', 'in_progress']);

      // Get offers in last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { count: offersCount } = await supabaseClient
        .from('contribution_offers')
        .select('*', { count: 'exact', head: true })
        .eq('space_id', spaceId)
        .gte('created_at', ninetyDaysAgo.toISOString());

      // Get validated contributions count
      const { count: validatedCount } = await supabaseClient
        .from('contribution_badges')
        .select('*', { count: 'exact', head: true })
        .eq('space_id', spaceId);

      return {
        open_needs: openNeedsCount || 0,
        offers_last_90_days: offersCount || 0,
        validated_contributions: validatedCount || 0,
      } as ContributeStats;
    },
    enabled: !!spaceId,
  });
}

export function useUserContributeStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-contribute-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { count: validatedCount } = await supabaseClient
        .from('contribution_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        validated_contributions: validatedCount || 0,
      };
    },
    enabled: !!userId,
  });
}

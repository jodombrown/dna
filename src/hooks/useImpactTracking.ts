import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImpactTracking = () => {
  const { toast } = useToast();

  const trackImpact = async (
    type: 'post' | 'comment' | 'reaction' | 'project' | 'event' | 'connection' | 'community_join',
    targetId: string,
    pillar?: 'connect' | 'collaborate' | 'contribute',
    targetType?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const points = getPointsForAction(type);

      const { error } = await supabase
        .from('impact_log')
        .insert({
          user_id: user.id,
          type,
          target_id: targetId,
          target_type: targetType,
          points,
          pillar,
          metadata: metadata || {}
        });

      if (error) {
        console.error('Error tracking impact:', error);
        return;
      }

      // Optionally show a subtle success indicator
      if (points > 0) {
        toast({
          title: `+${points} Impact Points`,
          description: `Great work! You're making a difference.`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error tracking impact:', error);
    }
  };

  const getPointsForAction = (type: string): number => {
    switch (type) {
      case 'post': return 10;
      case 'comment': return 3;
      case 'reaction': return 1;
      case 'connection': return 5;
      case 'project': return 20;
      case 'event': return 15;
      case 'community_join': return 8;
      default: return 0;
    }
  };

  const getUserImpactSummary = async (userId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('user_impact_summary')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching impact summary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching impact summary:', error);
      return null;
    }
  };

  return {
    trackImpact,
    getUserImpactSummary
  };
};
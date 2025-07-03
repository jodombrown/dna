
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Contribution, ContributionType } from '@/types/contributionTypes';

export const useContributions = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);

  const targetUserId = userId || user?.id;

  const fetchContributions = async () => {
    if (!targetUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data to match our Contribution interface
      const typedContributions = (data || []).map(item => ({
        ...item,
        type: item.type as ContributionType,
        metadata: (item.metadata as Record<string, any>) || {}
      }));

      setContributions(typedContributions);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contributions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackContribution = async (
    type: ContributionType,
    targetId: string,
    targetTitle?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contributions')
        .insert({
          user_id: user.id,
          type,
          target_id: targetId,
          target_title: targetTitle || null,
          metadata: metadata || {}
        });

      if (error) throw error;

      // Refresh contributions if viewing current user
      if (targetUserId === user.id) {
        fetchContributions();
      }
    } catch (error) {
      console.error('Error tracking contribution:', error);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [targetUserId]);

  return {
    contributions,
    loading,
    trackContribution,
    refreshContributions: fetchContributions
  };
};

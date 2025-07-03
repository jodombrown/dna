
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Contribution {
  id: string;
  user_id: string;
  type: 'post' | 'initiative' | 'event' | 'opportunity' | 'community' | 'newsletter';
  target_id: string;
  target_title: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

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

      setContributions(data || []);
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
    type: Contribution['type'],
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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BetaProfile {
  id: string;
  is_beta_tester: boolean;
  beta_phase: string | null;
  beta_expires_at: string | null;
  beta_feedback_count: number;
  beta_features_tested: string[];
  beta_status: 'active' | 'expired' | 'graduated' | 'paused';
  beta_signup_data: Record<string, any>;
}

export const useBetaStatus = () => {
  const queryClient = useQueryClient();

  const getBetaProfile = useQuery({
    queryKey: ['beta-profile'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          is_beta_tester,
          beta_phase,
          beta_expires_at,
          beta_feedback_count,
          beta_features_tested,
          beta_status,
          beta_signup_data
        `)
        .eq('id', user.user.id)
        .single();

      if (error) throw error;
      return data as BetaProfile;
    },
  });

  const markFeatureTested = useMutation({
    mutationFn: async (featureName: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Get current features tested
      const { data: profile } = await supabase
        .from('profiles')
        .select('beta_features_tested')
        .eq('id', user.user.id)
        .single();

      const currentFeatures = profile?.beta_features_tested || [];
      
      if (!currentFeatures.includes(featureName)) {
        const updatedFeatures = [...currentFeatures, featureName];
        
        const { error } = await supabase
          .from('profiles')
          .update({ beta_features_tested: updatedFeatures })
          .eq('id', user.user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-profile'] });
    },
  });

  const updateBetaStatus = useMutation({
    mutationFn: async (status: 'active' | 'expired' | 'graduated' | 'paused') => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ beta_status: status })
        .eq('id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-profile'] });
    },
  });

  const extendBetaPeriod = useMutation({
    mutationFn: async (days: number) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const newExpiration = new Date();
      newExpiration.setDate(newExpiration.getDate() + days);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          beta_expires_at: newExpiration.toISOString(),
          beta_status: 'active'
        })
        .eq('id', user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-profile'] });
    },
  });

  const checkBetaExpiration = () => {
    if (!getBetaProfile.data) return null;
    
    const { beta_expires_at, is_beta_tester } = getBetaProfile.data;
    if (!is_beta_tester || !beta_expires_at) return null;

    const expirationDate = new Date(beta_expires_at);
    const now = new Date();
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isExpired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      expirationDate
    };
  };

  return {
    betaProfile: getBetaProfile.data,
    isLoading: getBetaProfile.isLoading,
    markFeatureTested: markFeatureTested.mutate,
    updateBetaStatus: updateBetaStatus.mutate,
    extendBetaPeriod: extendBetaPeriod.mutate,
    checkBetaExpiration,
    refetch: getBetaProfile.refetch,
  };
};
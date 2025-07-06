import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LaunchConfig } from '@/types/referralTypes';
import { useToast } from '@/hooks/use-toast';

export const useLaunchConfig = () => {
  const [config, setConfig] = useState<LaunchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLaunchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('launch_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConfig(data as LaunchConfig);
    } catch (error) {
      console.error('Error fetching launch config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch launch configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isInviteOnly = () => {
    return config?.launch_mode === 'soft_launch';
  };

  const canAcceptMoreInvites = () => {
    if (!config) return false;
    return config.current_invites < config.max_invites;
  };

  const updateLaunchMode = async (mode: 'soft_launch' | 'open_access') => {
    try {
      const { error } = await supabase
        .from('launch_config')
        .update({ launch_mode: mode })
        .eq('id', config?.id);

      if (error) throw error;

      toast({
        title: "Launch mode updated",
        description: `Platform is now in ${mode.replace('_', ' ')} mode`,
      });

      await fetchLaunchConfig();
    } catch (error) {
      console.error('Error updating launch mode:', error);
      toast({
        title: "Error",
        description: "Failed to update launch mode",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLaunchConfig();
  }, []);

  return {
    config,
    loading,
    isInviteOnly,
    canAcceptMoreInvites,
    updateLaunchMode,
    refetch: fetchLaunchConfig
  };
};
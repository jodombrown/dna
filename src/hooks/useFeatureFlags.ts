import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlags {
  communities: boolean;
  organizations: boolean;
  contribution_pathways: boolean;
  newsletters: boolean;
  developer_debug_tools: boolean;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    communities: false,
    organizations: false,
    contribution_pathways: false,
    newsletters: false,
    developer_debug_tools: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('feature_key, is_enabled');

      if (error) throw error;

      const flagsObject = data.reduce((acc, flag) => {
        acc[flag.feature_key as keyof FeatureFlags] = flag.is_enabled;
        return acc;
      }, {} as FeatureFlags);

      setFlags(flagsObject);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('feature_flags_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'feature_flags' },
        () => fetchFlags()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { flags, loading, refetch: fetchFlags };
};
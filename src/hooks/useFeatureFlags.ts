import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  DNA_EVENTS_V2: boolean;
  REGISTRATION_ENABLED: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  DNA_EVENTS_V2: import.meta.env.VITE_DNA_EVENTS_V2 === 'true',
  REGISTRATION_ENABLED: false, // Default to locked during beta
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        // Try to load from Supabase feature_flags table
        const { data, error } = await supabase
          .from('feature_flags')
          .select('feature_key, is_enabled');

        if (!error && data) {
          const flagsFromDB = data.reduce((acc, flag) => {
            if (flag.feature_key in DEFAULT_FLAGS) {
              acc[flag.feature_key as keyof FeatureFlags] = flag.is_enabled;
            }
            return acc;
          }, {} as Partial<FeatureFlags>);

          setFlags({ ...DEFAULT_FLAGS, ...flagsFromDB });
        } else {
          // Fallback to defaults if DB fails
          setFlags(DEFAULT_FLAGS);
        }
      } catch {
        setFlags(DEFAULT_FLAGS);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  // Return simplified interface as requested
  return { 
    eventsV2: flags.DNA_EVENTS_V2,
    registrationEnabled: flags.REGISTRATION_ENABLED,
    loading 
  };
};

export const useFeatureFlag = (flagName: keyof FeatureFlags) => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('feature_key, is_enabled');

        if (!error && data) {
          const flagsFromDB = data.reduce((acc, flag) => {
            if (flag.feature_key in DEFAULT_FLAGS) {
              acc[flag.feature_key as keyof FeatureFlags] = flag.is_enabled;
            }
            return acc;
          }, {} as Partial<FeatureFlags>);

          setFlags({ ...DEFAULT_FLAGS, ...flagsFromDB });
        } else {
          setFlags(DEFAULT_FLAGS);
        }
      } catch {
        setFlags(DEFAULT_FLAGS);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, []);

  return { enabled: flags[flagName], loading };
};
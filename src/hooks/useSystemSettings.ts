import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  category: string;
  description: string;
  is_sensitive: boolean;
  requires_restart: boolean;
}

interface UseSystemSettingsReturn {
  settings: Record<string, any>;
  allSettings: SystemSetting[];
  getSetting: <T = any>(key: string, defaultValue?: T) => T;
  updateSetting: (key: string, value: any) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSystemSettings = (): UseSystemSettingsReturn => {
  const [allSettings, setAllSettings] = useState<SystemSetting[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error: fetchError } = await (supabase
        .from('system_settings' as any) as any)
        .select('*')
        .order('category')
        .order('setting_key');

      if (fetchError) {
        console.error('Error fetching settings:', fetchError);
        setError('Failed to fetch settings');
        return;
      }

      if (data) {
        setAllSettings(data as unknown as SystemSetting[]);

        // Convert to key-value map
        const settingsMap: Record<string, any> = {};
        (data as any[]).forEach((setting: SystemSetting) => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        setSettings(settingsMap);
        setError(null);
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('An error occurred while fetching settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = useCallback(<T = any>(key: string, defaultValue?: T): T => {
    const value = settings[key];
    if (value === undefined || value === null) {
      return defaultValue as T;
    }
    return value as T;
  }, [settings]);

  const updateSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('update_system_setting', {
        p_key: key,
        p_value: value
      });

      if (rpcError) {
        console.error('Error updating setting:', rpcError);
        return false;
      }

      if (data) {
        // Update local state
        setSettings(prev => ({
          ...prev,
          [key]: value
        }));
        return true;
      }

      return false;
    } catch (err) {
      console.error('Setting update error:', err);
      return false;
    }
  }, []);

  return {
    settings,
    allSettings,
    getSetting,
    updateSetting,
    isLoading,
    error,
    refetch: fetchSettings
  };
};

export default useSystemSettings;

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useProfilesRealtime(onChange: () => void) {
  useEffect(() => {
    const instanceId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const ch = supabase
      .channel(`realtime:profiles_${instanceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [onChange]);
}

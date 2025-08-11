import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useProfilesRealtime(onChange: () => void) {
  useEffect(() => {
    const ch = supabase
      .channel('realtime:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [onChange]);
}

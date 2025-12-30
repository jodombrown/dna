import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        if (!user?.id) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const { data } = await supabase.rpc('is_admin_user', { _user_id: user.id });
        setIsAdmin(Boolean(data));
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [user?.id]);

  return { isAdmin, loading } as const;
};

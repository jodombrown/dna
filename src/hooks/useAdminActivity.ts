import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAdminActivityReturn {
  logActivity: (
    actionType: string,
    actionDetails?: Record<string, any>,
    targetUserId?: string
  ) => Promise<string | null>;
  isLogging: boolean;
  error: string | null;
}

export const useAdminActivity = (): UseAdminActivityReturn => {
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logActivity = useCallback(async (
    actionType: string,
    actionDetails: Record<string, any> = {},
    targetUserId?: string
  ): Promise<string | null> => {
    setIsLogging(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('log_admin_activity', {
        p_action_type: actionType,
        p_action_details: actionDetails,
        p_target_user_id: targetUserId || null
      });

      if (rpcError) {
        console.error('Error logging activity:', rpcError);
        setError('Failed to log activity');
        return null;
      }

      return data as string;
    } catch (err) {
      console.error('Activity logging error:', err);
      setError('An error occurred while logging activity');
      return null;
    } finally {
      setIsLogging(false);
    }
  }, []);

  return {
    logActivity,
    isLogging,
    error
  };
};

export default useAdminActivity;

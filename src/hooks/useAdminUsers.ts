
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasRole } = useAdminAuth();

  const fetchAdminUsers = async () => {
    if (!hasRole('super_admin')) {
      setError('Insufficient permissions');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAdminUsers(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [hasRole]);

  const refetch = () => {
    fetchAdminUsers();
  };

  return {
    adminUsers,
    loading,
    error,
    refetch
  };
};


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
  const { adminUser, loading: authLoading } = useAdminAuth();

  const fetchAdminUsers = async () => {
    // Don't fetch if auth is still loading or user is not a super admin
    if (authLoading || !adminUser || adminUser.role !== 'super_admin') {
      setLoading(false);
      if (!authLoading && (!adminUser || adminUser.role !== 'super_admin')) {
        setError('Insufficient permissions');
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAdminUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [authLoading, adminUser?.role]); // Only depend on authLoading and the role, not the whole adminUser object

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

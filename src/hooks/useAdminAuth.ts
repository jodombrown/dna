
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'super_admin' | 'content_moderator' | 'analytics_viewer' | 'user_manager' | 'event_manager';

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminAuth = () => {
  const { user, loading: authLoading } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    const fetchAdminUser = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setAdminUser(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching admin user:', err);
        setError(err.message);
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminUser();
  }, [user, authLoading]);

  const hasRole = (requiredRole: AdminRole): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === 'super_admin') return true;
    return adminUser.role === requiredRole;
  };

  const hasAnyRole = (roles: AdminRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const isAdmin = adminUser !== null && adminUser.is_active;

  return {
    adminUser,
    loading,
    error,
    isAdmin,
    hasRole,
    hasAnyRole,
    role: adminUser?.role || null
  };
};

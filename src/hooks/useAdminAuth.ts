import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdminRoleLevel =
  | 'super_admin'
  | 'platform_admin'
  | 'content_admin'
  | 'analytics_admin'
  | 'support_admin'
  | 'event_admin';

export interface AdminUser {
  userId: string;
  email: string;
  isAdmin: boolean;
  roleLevel: AdminRoleLevel | null;
  isSuperAdmin: boolean;
}

interface UseAdminAuthReturn {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  hasRole: (roles: AdminRoleLevel[]) => boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// Role hierarchy - higher index means more permissions
const ROLE_HIERARCHY: AdminRoleLevel[] = [
  'event_admin',
  'support_admin',
  'analytics_admin',
  'content_admin',
  'platform_admin',
  'super_admin'
];

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setAdminUser(null);
        return;
      }

      const { data, error } = await (supabase as any).rpc('get_current_admin_status');

      if (error) {
        setAdminUser(null);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0];
        setAdminUser({
          userId: result.user_id,
          email: result.email,
          isAdmin: result.is_admin,
          roleLevel: result.role_level as AdminRoleLevel | null,
          isSuperAdmin: result.is_super_admin
        });
      } else {
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAdminUser(null);
        setIsLoading(false);
      } else {
        fetchAdminStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAdminStatus]);

  const hasRole = useCallback((roles: AdminRoleLevel[]): boolean => {
    if (!adminUser?.isAdmin) return false;
    if (adminUser.isSuperAdmin) return true;
    if (!adminUser.roleLevel) return false;

    // Check direct role match
    if (roles.includes(adminUser.roleLevel)) return true;

    // Check hierarchy - if user's role is higher than any required role
    const userRoleIndex = ROLE_HIERARCHY.indexOf(adminUser.roleLevel);
    const minRequiredIndex = Math.min(
      ...roles.map(r => ROLE_HIERARCHY.indexOf(r))
    );

    return userRoleIndex >= minRequiredIndex;
  }, [adminUser]);

  const logout = useCallback(async () => {
    try {
      await (supabase as any).rpc('end_admin_session', { p_reason: 'manual' });
      await supabase.auth.signOut();
      setAdminUser(null);
    } catch (error) {
      throw error;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await fetchAdminStatus();
  }, [fetchAdminStatus]);

  return {
    adminUser,
    isLoading,
    isAuthenticated: !!adminUser?.isAdmin,
    isSuperAdmin: !!adminUser?.isSuperAdmin,
    hasRole,
    logout,
    refreshAuth
  };
};

export default useAdminAuth;

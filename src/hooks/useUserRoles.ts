
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'moderator' | 'organization' | 'admin';

interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      // First try to get role from profiles table (synced by trigger)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUserRole(profileData?.user_role || 'user');
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user role:', err);
      setError(err.message);
      setUserRole('user'); // Default fallback
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_by: user?.id,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${role}`,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error assigning role:', err);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      moderator: 2,
      organization: 2,
      admin: 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(userRole);
  };

  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };

  const isModerator = (): boolean => {
    return userRole === 'moderator' || userRole === 'admin';
  };

  const isOrganization = (): boolean => {
    return userRole === 'organization' || userRole === 'admin';
  };

  return {
    userRole,
    loading,
    error,
    assignRole,
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    isOrganization,
    refetch: fetchUserRole
  };
};

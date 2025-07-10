import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';
import { Spinner } from '@/components/ui/spinner';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin' | 'moderator';
}

const AdminAuthWrapper: React.FC<AdminAuthWrapperProps> = ({ 
  children, 
  requiredRole = 'admin' 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Use real-time query for admin access
  const { data: adminUsers, loading, error } = useRealtimeQuery('admin-auth-check', {
    table: 'admin_users',
    select: 'role, is_active',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    enabled: !!user
  });

  const isAuthorized = useMemo(() => {
    if (!user || loading || error || adminUsers.length === 0) {
      return false;
    }

    const adminUser = adminUsers[0];
    if (!adminUser.is_active) {
      return false;
    }

    return checkRoleAccess(adminUser.role, requiredRole);
  }, [user, adminUsers, loading, error, requiredRole]);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    if (!loading && (!isAuthorized || error)) {
      navigate('/admin/login');
    }
  }, [user, loading, isAuthorized, error, navigate]);

  const checkRoleAccess = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy = {
      'moderator': 1,
      'admin': 2,
      'superadmin': 3
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Navigation will happen in useEffect
  }

  return <>{children}</>;
};

export default AdminAuthWrapper;
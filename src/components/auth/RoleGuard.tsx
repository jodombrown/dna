import React from 'react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

interface RoleGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  adminOnly = false, 
  userOnly = false,
  fallback = null 
}) => {
  const { isAdmin, role } = useRoleBasedAccess();

  if (adminOnly && !isAdmin) {
    return <>{fallback}</>;
  }

  if (userOnly && isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
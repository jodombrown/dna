
import React from 'react';
import { useUserRoles, UserRole } from '@/hooks/useUserRoles';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  requireAny?: boolean; // If true, user needs ANY of the roles; if false, needs ALL roles
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredRole,
  requiredRoles = [],
  fallback = null,
  requireAny = true
}) => {
  const { userRole, loading } = useUserRoles();

  if (loading) {
    return <>{fallback}</>;
  }

  const roles = requiredRole ? [requiredRole] : requiredRoles;
  
  if (roles.length === 0) {
    return <>{children}</>;
  }

  const hasPermission = requireAny 
    ? roles.includes(userRole)
    : roles.every(role => {
        const roleHierarchy: Record<UserRole, number> = {
          user: 1,
          moderator: 2,
          organization: 2,
          admin: 4
        };
        return roleHierarchy[userRole] >= roleHierarchy[role];
      });

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;

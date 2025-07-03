
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Building, Users, Crown } from 'lucide-react';
import { UserRole } from '@/hooks/useUserRoles';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', showIcon = true }) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Crown
        };
      case 'moderator':
        return {
          label: 'Moderator',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Shield
        };
      case 'organization':
        return {
          label: 'Organization',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Building
        };
      case 'user':
      default:
        return {
          label: 'Member',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Users
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${sizeClasses[size]} flex items-center gap-1 font-medium`}
    >
      {showIcon && <Icon className={iconSize[size]} />}
      {config.label}
    </Badge>
  );
};

export default RoleBadge;

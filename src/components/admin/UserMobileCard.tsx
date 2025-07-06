import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminUser } from '@/hooks/useAdminUsers';
import { UserStatusBadge } from './UserStatusBadge';
import { UserActionsDropdown } from './UserActionsDropdown';

interface UserMobileCardProps {
  user: AdminUser;
  onViewProfile: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export function UserMobileCard({
  user,
  onViewProfile,
  onEditUser,
  onToggleStatus,
  onDeleteUser
}: UserMobileCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-dna-emerald to-dna-copper text-white">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {user.full_name || 'Unnamed User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <UserStatusBadge status={user.status} />
          <UserActionsDropdown
            user={user}
            onViewProfile={onViewProfile}
            onEditUser={onEditUser}
            onToggleStatus={onToggleStatus}
            onDeleteUser={onDeleteUser}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Joined</p>
          <p className="font-medium">{formatDate(user.created_at)}</p>
        </div>
        <div>
          <p className="text-gray-500">Last Activity</p>
          <p className="font-medium">
            {user.last_activity ? formatDate(user.last_activity) : 'No activity'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Posts</p>
          <p className="font-medium">{user.post_count || 0}</p>
        </div>
        <div>
          <p className="text-gray-500">Communities</p>
          <p className="font-medium">{user.community_count || 0}</p>
        </div>
      </div>
    </Card>
  );
}
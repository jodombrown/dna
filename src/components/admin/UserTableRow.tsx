import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminUser } from '@/hooks/useAdminUsers';
import { UserStatusBadge } from './UserStatusBadge';
import { UserActionsDropdown } from './UserActionsDropdown';

interface UserTableRowProps {
  user: AdminUser;
  onViewProfile: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onVerifyUser?: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export function UserTableRow({
  user,
  onViewProfile,
  onEditUser,
  onToggleStatus,
  onVerifyUser,
  onDeleteUser
}: UserTableRowProps) {
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
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-dna-emerald to-dna-copper text-white text-xs">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {user.full_name || 'Unnamed User'}
            </p>
            <p className="text-sm text-gray-500 truncate max-w-48">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <UserStatusBadge status={user.status} />
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {formatDate(user.created_at)}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {user.last_activity ? formatDate(user.last_activity) : 'No activity'}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {user.post_count || 0}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {user.community_count || 0}
      </TableCell>
      <TableCell>
        <UserActionsDropdown
          user={user}
          onViewProfile={onViewProfile}
          onEditUser={onEditUser}
          onToggleStatus={onToggleStatus}
          onVerifyUser={onVerifyUser}
          onDeleteUser={onDeleteUser}
        />
      </TableCell>
    </TableRow>
  );
}
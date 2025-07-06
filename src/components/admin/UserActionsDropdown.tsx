import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX, 
  Trash2,
  Shield
} from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminUsers';

interface UserActionsDropdownProps {
  user: AdminUser;
  onViewProfile: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export function UserActionsDropdown({
  user,
  onViewProfile,
  onEditUser,
  onToggleStatus,
  onDeleteUser
}: UserActionsDropdownProps) {
  const getStatusAction = () => {
    switch (user.status) {
      case 'active':
        return { label: 'Suspend User', icon: UserX };
      case 'suspended':
        return { label: 'Activate User', icon: UserCheck };
      case 'pending':
        return { label: 'Approve User', icon: UserCheck };
      default:
        return { label: 'Toggle Status', icon: Shield };
    }
  };

  const statusAction = getStatusAction();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
        <DropdownMenuItem 
          onClick={() => onViewProfile(user)}
          className="cursor-pointer hover:bg-gray-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onEditUser(user)}
          className="cursor-pointer hover:bg-gray-50"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit User
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onToggleStatus(user)}
          className="cursor-pointer hover:bg-gray-50"
        >
          <statusAction.icon className="mr-2 h-4 w-4" />
          {statusAction.label}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onDeleteUser(user)}
          className="cursor-pointer hover:bg-red-50 text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
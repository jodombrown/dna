import { useState } from 'react';
import { AdminUser } from './useAdminUsers';
import { useToast } from '@/hooks/use-toast';

interface UseUserActionsResult {
  deleteDialog: {
    open: boolean;
    user: AdminUser | null;
  };
  statusDialog: {
    open: boolean;
    user: AdminUser | null;
    action: string;
  };
  handleViewProfile: (user: AdminUser) => void;
  handleEditUser: (user: AdminUser) => void;
  handleToggleStatus: (user: AdminUser) => void;
  handleDeleteUser: (user: AdminUser) => void;
  confirmDelete: () => void;
  confirmStatusChange: () => void;
  cancelDelete: () => void;
  cancelStatusChange: () => void;
}

export function useUserActions(): UseUserActionsResult {
  const { toast } = useToast();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null
  });

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
    action: string;
  }>({
    open: false,
    user: null,
    action: ''
  });

  const handleViewProfile = (user: AdminUser) => {
    // TODO: Implement profile modal or navigation in Phase 5
    toast({
      title: "View Profile",
      description: `Profile view for ${user.full_name || user.email} - Coming in Phase 5`,
    });
  };

  const handleEditUser = (user: AdminUser) => {
    // TODO: Implement user editing in Phase 5
    toast({
      title: "Edit User",
      description: `Edit functionality for ${user.full_name || user.email} - Coming in Phase 5`,
    });
  };

  const handleToggleStatus = (user: AdminUser) => {
    let action: string;
    switch (user.status) {
      case 'active':
        action = 'Suspend User';
        break;
      case 'suspended':
        action = 'Activate User';
        break;
      case 'pending':
        action = 'Approve User';
        break;
      default:
        action = 'Change Status';
    }

    setStatusDialog({
      open: true,
      user,
      action
    });
  };

  const handleDeleteUser = (user: AdminUser) => {
    setDeleteDialog({
      open: true,
      user
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.user) {
      // TODO: Implement actual user deletion with Supabase in Phase 5
      toast({
        title: "User Deleted",
        description: `${deleteDialog.user.full_name || deleteDialog.user.email} has been deleted (mock action)`,
        variant: "destructive"
      });
    }
    setDeleteDialog({ open: false, user: null });
  };

  const confirmStatusChange = () => {
    if (statusDialog.user) {
      // TODO: Implement actual status change with Supabase in Phase 5
      toast({
        title: "Status Changed",
        description: `${statusDialog.user.full_name || statusDialog.user.email} status updated (mock action)`,
      });
    }
    setStatusDialog({ open: false, user: null, action: '' });
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const cancelStatusChange = () => {
    setStatusDialog({ open: false, user: null, action: '' });
  };

  return {
    deleteDialog,
    statusDialog,
    handleViewProfile,
    handleEditUser,
    handleToggleStatus,
    handleDeleteUser,
    confirmDelete,
    confirmStatusChange,
    cancelDelete,
    cancelStatusChange
  };
}
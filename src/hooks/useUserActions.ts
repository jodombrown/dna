import { useState } from 'react';
import { AdminUser } from './useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseUserActionsResult {
  profileModal: {
    open: boolean;
    user: AdminUser | null;
  };
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
  closeProfile: () => void;
}

export function useUserActions(): UseUserActionsResult {
  const { toast } = useToast();
  
  const [profileModal, setProfileModal] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null
  });
  
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
    setProfileModal({
      open: true,
      user
    });
  };

  const handleEditUser = (user: AdminUser) => {
    // TODO: Implement comprehensive user editing form in future release
    toast({
      title: "Edit User",
      description: `Edit functionality for ${user.full_name || user.email} - Feature planned for future release`,
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

  const confirmDelete = async () => {
    if (deleteDialog.user) {
      try {
        console.log('Attempting to delete user:', deleteDialog.user.id);
        
        // Call the delete user edge function using Supabase client
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId: deleteDialog.user.id }
        });

        console.log('Edge function response:', { data, error });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error(error.message || 'Failed to delete user');
        }

        // Check if the response indicates success
        if (data && data.error) {
          console.error('Edge function returned error:', data.error);
          throw new Error(data.error);
        }

        toast({
          title: "User Deleted",
          description: `${deleteDialog.user.full_name || deleteDialog.user.email} has been deleted successfully`,
          variant: "destructive"
        });
        
        // Refresh the users list after successful deletion
        window.location.reload();
      } catch (error) {
        console.error('Delete user error:', error);
        toast({
          title: "Delete Failed",
          description: error instanceof Error ? error.message : "Failed to delete user",
          variant: "destructive"
        });
      }
    }
    setDeleteDialog({ open: false, user: null });
  };

  const confirmStatusChange = () => {
    if (statusDialog.user) {
      // TODO: Implement actual status change with Supabase in future release  
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

  const closeProfile = () => {
    setProfileModal({ open: false, user: null });
  };

  return {
    profileModal,
    deleteDialog,
    statusDialog,
    handleViewProfile,
    handleEditUser,
    handleToggleStatus,
    handleDeleteUser,
    confirmDelete,
    confirmStatusChange,
    cancelDelete,
    cancelStatusChange,
    closeProfile
  };
}
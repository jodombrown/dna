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
  verifyDialog: {
    open: boolean;
    user: AdminUser | null;
  };
  handleViewProfile: (user: AdminUser) => void;
  handleEditUser: (user: AdminUser) => void;
  handleToggleStatus: (user: AdminUser) => void;
  handleVerifyUser: (user: AdminUser) => void;
  handleDeleteUser: (user: AdminUser) => void;
  confirmDelete: () => void;
  confirmStatusChange: () => void;
  confirmVerify: () => void;
  cancelDelete: () => void;
  cancelStatusChange: () => void;
  cancelVerify: () => void;
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

  const [verifyDialog, setVerifyDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
  }>({
    open: false,
    user: null
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

  const handleVerifyUser = (user: AdminUser) => {
    setVerifyDialog({
      open: true,
      user
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

  const confirmStatusChange = async () => {
    if (statusDialog.user) {
      try {
        const user = statusDialog.user;
        let updateData: any = {};
        
        switch (statusDialog.action) {
          case 'Suspend User':
            // Add to a banned_users table or mark as suspended
            updateData = { status: 'suspended' };
            break;
          case 'Activate User':
            updateData = { status: 'active' };
            break;
          case 'Approve User':
            updateData = { status: 'active' };
            break;
        }
        
        // Update profile with status (assuming we add this field)
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
          
        if (error) throw error;
        
        toast({
          title: "Status Updated",
          description: `${statusDialog.action} completed for ${user.full_name || user.email}`,
        });
        
        // Refresh the page to show updated data
        window.location.reload();
      } catch (error) {
        console.error('Status change error:', error);
        toast({
          title: "Status Change Failed",
          description: error instanceof Error ? error.message : "Failed to update user status",
          variant: "destructive"
        });
      }
    }
    setStatusDialog({ open: false, user: null, action: '' });
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const cancelStatusChange = () => {
    setStatusDialog({ open: false, user: null, action: '' });
  };

  const confirmVerify = async () => {
    if (verifyDialog.user) {
      try {
        const user = verifyDialog.user;
        
        // Create or update ADIN contributor profile
        const { error } = await supabase
          .from('user_adin_profile')
          .upsert({
            user_id: user.id,
            is_verified_contributor: true,
            contributor_verified_at: new Date().toISOString(),
            contributor_impact_type: 'verified',
            contributor_score: 10,
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast({
          title: "User Verified",
          description: `${user.full_name || user.email} has been verified as a contributor`,
        });
        
        window.location.reload();
      } catch (error) {
        console.error('Verify user error:', error);
        toast({
          title: "Verification Failed",
          description: error instanceof Error ? error.message : "Failed to verify user",
          variant: "destructive"
        });
      }
    }
    setVerifyDialog({ open: false, user: null });
  };

  const cancelVerify = () => {
    setVerifyDialog({ open: false, user: null });
  };

  const closeProfile = () => {
    setProfileModal({ open: false, user: null });
  };

  return {
    profileModal,
    deleteDialog,
    statusDialog,
    verifyDialog,
    handleViewProfile,
    handleEditUser,
    handleToggleStatus,
    handleVerifyUser,
    handleDeleteUser,
    confirmDelete,
    confirmStatusChange,
    confirmVerify,
    cancelDelete,
    cancelStatusChange,
    cancelVerify,
    closeProfile
  };
}
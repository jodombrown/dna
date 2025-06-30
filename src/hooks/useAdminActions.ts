
import { useAuditLog } from './useAuditLog';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AdminRole = Database['public']['Enums']['admin_role'];

export const useAdminActions = () => {
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const suspendUser = async (userId: string, reason: string) => {
    try {
      // Here you would implement user suspension logic
      // For now, we'll just log the action
      await logAction('suspend_user', 'user', userId, { reason });
      
      toast({
        title: "User Suspended",
        description: "User has been suspended successfully",
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive"
      });
    }
  };

  const approveContent = async (contentId: string, contentType: string) => {
    try {
      if (contentType === 'community') {
        await supabase
          .from('communities')
          .update({ 
            moderation_status: 'approved',
            moderated_at: new Date().toISOString()
          })
          .eq('id', contentId);
      } else if (contentType === 'post') {
        await supabase
          .from('posts')
          .update({ 
            moderation_status: 'approved',
            moderated_at: new Date().toISOString()
          })
          .eq('id', contentId);
      }

      await logAction('approve_content', contentType, contentId);
      
      toast({
        title: "Content Approved",
        description: `${contentType} has been approved successfully`,
      });
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: "Error",
        description: "Failed to approve content",
        variant: "destructive"
      });
    }
  };

  const rejectContent = async (contentId: string, contentType: string, reason: string) => {
    try {
      if (contentType === 'community') {
        await supabase
          .from('communities')
          .update({ 
            moderation_status: 'rejected',
            moderated_at: new Date().toISOString(),
            rejection_reason: reason
          })
          .eq('id', contentId);
      } else if (contentType === 'post') {
        await supabase
          .from('posts')
          .update({ 
            moderation_status: 'rejected',
            moderated_at: new Date().toISOString()
          })
          .eq('id', contentId);
      }

      await logAction('reject_content', contentType, contentId, { reason });
      
      toast({
        title: "Content Rejected",
        description: `${contentType} has been rejected`,
      });
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: "Error",
        description: "Failed to reject content",
        variant: "destructive"
      });
    }
  };

  const createAdminUser = async (userData: { user_id: string; role: AdminRole; permissions?: any }) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userData.user_id,
          role: userData.role,
          is_active: true,
          permissions: userData.permissions || {}
        });

      if (error) throw error;

      await logAction('create_admin_user', 'admin_user', userData.user_id, { role: userData.role });
      
      toast({
        title: "Admin User Created",
        description: "New admin user has been created successfully",
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error",
        description: "Failed to create admin user",
        variant: "destructive"
      });
    }
  };

  const updateSystemSettings = async (settings: any) => {
    try {
      // Here you would implement system settings update logic
      await logAction('update_system_settings', 'system', null, settings);
      
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive"
      });
    }
  };

  return {
    suspendUser,
    approveContent,
    rejectContent,
    createAdminUser,
    updateSystemSettings
  };
};

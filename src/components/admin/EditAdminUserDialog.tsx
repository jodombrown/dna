
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AdminRole = Database['public']['Enums']['admin_role'];

interface EditAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

const EditAdminUserDialog: React.FC<EditAdminUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess
}) => {
  const [role, setRole] = useState<AdminRole>('analytics_viewer');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.is_active);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({
          role: role,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user updated successfully.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error updating admin user:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update admin user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Admin User</DialogTitle>
          <DialogDescription>
            Update the role and status of the admin user.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>User ID</Label>
            <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-mono">
              {user.user_id}
            </div>
          </div>
          
          <div>
            <Label htmlFor="role">Admin Role</Label>
            <Select value={role} onValueChange={(value: AdminRole) => setRole(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="content_moderator">Content Moderator</SelectItem>
                <SelectItem value="user_manager">User Manager</SelectItem>
                <SelectItem value="event_manager">Event Manager</SelectItem>
                <SelectItem value="analytics_viewer">Analytics Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAdminUserDialog;

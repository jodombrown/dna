
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddAdminUserDialog: React.FC<AddAdminUserDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('analytics_viewer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert([
          {
            user_id: userId.trim(),
            role: role,
            is_active: true
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user added successfully.",
      });

      setUserId('');
      setRole('analytics_viewer');
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error adding admin user:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to add admin user.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Admin User</DialogTitle>
          <DialogDescription>
            Add a new admin user to the system. Enter their user ID and select their role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user UUID"
              required
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              The UUID of the user from the profiles table
            </p>
          </div>
          
          <div>
            <Label htmlFor="role">Admin Role</Label>
            <Select value={role} onValueChange={setRole}>
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
              {loading ? 'Adding...' : 'Add Admin User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdminUserDialog;

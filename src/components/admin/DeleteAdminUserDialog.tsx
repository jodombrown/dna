
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

interface DeleteAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

const DeleteAdminUserDialog: React.FC<DeleteAdminUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user deleted successfully.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error deleting admin user:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete admin user.",
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
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Delete Admin User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the admin user from the system.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">User Details:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">User ID:</span>
                <span className="ml-2 font-mono">{user.user_id}</span>
              </div>
              <div>
                <span className="font-medium">Role:</span>
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge className="ml-2" variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAdminUserDialog;

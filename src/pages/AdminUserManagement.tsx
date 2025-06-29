
import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AdminUserManagementHeader from '@/components/admin/AdminUserManagementHeader';
import AdminUserStats from '@/components/admin/AdminUserStats';
import AdminUserSearch from '@/components/admin/AdminUserSearch';
import AdminUserTable from '@/components/admin/AdminUserTable';
import AddAdminUserDialog from '@/components/admin/AddAdminUserDialog';
import EditAdminUserDialog from '@/components/admin/EditAdminUserDialog';
import DeleteAdminUserDialog from '@/components/admin/DeleteAdminUserDialog';

const AdminUserManagement = () => {
  const { adminUser, hasRole } = useAdminAuth();
  const { adminUsers, loading, error, refetch } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only super admins can access user management
  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permissions to manage admin users.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = adminUsers?.filter(user => 
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleDelete = (user: any) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleSuccess = () => {
    refetch();
    toast({
      title: "Success",
      description: "Admin user updated successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading admin users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load admin users: {error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminUserManagementHeader onAddUser={() => setShowAddDialog(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminUserStats adminUsers={adminUsers} />
        <AdminUserSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AdminUserTable 
          filteredUsers={filteredUsers}
          currentUserId={adminUser?.user_id}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Dialogs */}
      <AddAdminUserDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
      />
      
      {selectedUser && (
        <>
          <EditAdminUserDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            user={selectedUser}
            onSuccess={handleSuccess}
          />
          
          <DeleteAdminUserDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            user={selectedUser}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </div>
  );
};

export default AdminUserManagement;

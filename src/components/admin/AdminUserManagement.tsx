
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Edit, 
  Trash2,
  Eye,
  Ban
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminActions } from '@/hooks/useAdminActions';
import AddAdminUserDialog from './AddAdminUserDialog';
import EditAdminUserDialog from './EditAdminUserDialog';
import DeleteAdminUserDialog from './DeleteAdminUserDialog';
import { formatDistanceToNow } from 'date-fns';

const AdminUserManagement: React.FC = () => {
  const { adminUsers, regularUsers, loading, refetch } = useAdminUsers();
  const { suspendUser } = useAdminActions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'admin' | 'regular'>('admin');

  const filteredAdminUsers = adminUsers?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const filteredRegularUsers = regularUsers?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      content_moderator: 'bg-blue-100 text-blue-800',
      user_manager: 'bg-green-100 text-green-800',
      event_manager: 'bg-purple-100 text-purple-800',
      analytics_viewer: 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleSuspendUser = async (userId: string) => {
    await suspendUser(userId, 'Suspended by admin');
    refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading admin users...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-dna-emerald" />
              <div>
                <CardTitle>User Management</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage admin users and regular platform users
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Admin User
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'admin' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('admin')}
          className={activeTab === 'admin' ? 'bg-dna-emerald text-white' : ''}
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin Users ({adminUsers?.length || 0})
        </Button>
        <Button
          variant={activeTab === 'regular' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('regular')}
          className={activeTab === 'regular' ? 'bg-dna-emerald text-white' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          Regular Users ({regularUsers?.length || 0})
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={activeTab === 'admin' ? "Search admin users..." : "Search users..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'admin' && (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="content_moderator">Content Moderator</SelectItem>
                  <SelectItem value="user_manager">User Manager</SelectItem>
                  <SelectItem value="event_manager">Event Manager</SelectItem>
                  <SelectItem value="analytics_viewer">Analytics Viewer</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Table */}
      {activeTab === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAdminUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-dna-emerald/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-dna-emerald" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.user_id.substring(0, 8)}...</span>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {!user.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Created {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredAdminUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No admin users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Users Table */}
      {activeTab === 'regular' && (
        <Card>
          <CardHeader>
            <CardTitle>Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRegularUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.full_name || 'Unknown User'}</span>
                        {user.is_public && (
                          <Badge variant="outline">Public Profile</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuspendUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredRegularUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddAdminUserDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />

      <EditAdminUserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onSuccess={() => {
          refetch();
          setEditingUser(null);
        }}
      />

      <DeleteAdminUserDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        user={deletingUser}
        onSuccess={() => {
          refetch();
          setDeletingUser(null);
        }}
      />
    </div>
  );
};

export default AdminUserManagement;

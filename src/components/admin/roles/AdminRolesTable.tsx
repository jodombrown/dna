import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';
import { Search, Loader2, Edit, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'superadmin' | 'moderator';
  is_active: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function AdminRolesTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  // Use real-time queries for admin users and profiles
  const { data: adminData, loading: adminLoading, refetch } = useRealtimeQuery('admin-roles-admin-users', {
    table: 'admin_users',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    enabled: true
  });

  const userIds = useMemo(() => 
    adminData.map(admin => admin.user_id), 
    [adminData]
  );

  const { data: profilesData, loading: profilesLoading } = useRealtimeQuery('admin-roles-profiles', {
    table: 'profiles',
    select: 'id, full_name, email',
    filter: userIds.length > 0 ? `id=in.(${userIds.join(',')})` : undefined,
    enabled: userIds.length > 0
  });

  // Combine admin data with profiles
  const adminUsers = useMemo(() => {
    return adminData.map(admin => ({
      ...admin,
      profiles: profilesData.find(profile => profile.id === admin.user_id)
    }));
  }, [adminData, profilesData]);

  const loading = adminLoading || profilesLoading;

  const updateAdminRole = async (userId: string, newRole: 'admin' | 'superadmin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      await refetch();

      toast({
        title: "Role Updated",
        description: "Admin role has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating admin role:', error);
      toast({
        title: "Error",
        description: "Failed to update admin role.",
        variant: "destructive",
      });
    }
  };

  const toggleAdminStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      await refetch();

      toast({
        title: isActive ? "Admin Suspended" : "Admin Activated",
        description: `Admin access has been ${isActive ? 'suspended' : 'activated'}.`,
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update admin status.",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = adminUsers.filter(admin => {
    const matchesSearch = admin.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'default';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Users</CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">
                  {admin.profiles?.full_name || 'Unknown'}
                </TableCell>
                <TableCell>{admin.profiles?.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(admin.role)}>
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                    {admin.is_active ? 'Active' : 'Suspended'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(admin.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Select
                      value={admin.role}
                      onValueChange={(newRole) => updateAdminRole(admin.user_id, newRole as 'admin' | 'superadmin' | 'moderator')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={admin.is_active ? 'text-red-600' : 'text-green-600'}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {admin.is_active ? 'Suspend' : 'Activate'} Admin Access
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to {admin.is_active ? 'suspend' : 'activate'} admin access for {admin.profiles?.full_name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleAdminStatus(admin.user_id, admin.is_active)}
                            className={admin.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                          >
                            {admin.is_active ? 'Suspend' : 'Activate'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredAdmins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No admin users found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
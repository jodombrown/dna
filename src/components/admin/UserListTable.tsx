import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/hooks/useAdminUsers';
import { UserTableRow } from './UserTableRow';
import { UserMobileCard } from './UserMobileCard';
import { LoadingState, ErrorState, EmptyState } from './UserTableStates';

interface UserListTableProps {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  onViewProfile: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onDeleteUser: (user: AdminUser) => void;
}

export function UserListTable({ 
  users, 
  loading, 
  error, 
  onViewProfile, 
  onEditUser, 
  onToggleStatus, 
  onDeleteUser 
}: UserListTableProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Platform Users</span>
          <Badge variant="outline" className="text-xs">
            {users.length} users
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Communities</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onViewProfile={onViewProfile}
                  onEditUser={onEditUser}
                  onToggleStatus={onToggleStatus}
                  onDeleteUser={onDeleteUser}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {users.map((user) => (
            <UserMobileCard
              key={user.id}
              user={user}
              onViewProfile={onViewProfile}
              onEditUser={onEditUser}
              onToggleStatus={onToggleStatus}
              onDeleteUser={onDeleteUser}
            />
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && <EmptyState />}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';

interface AdminUserStatsProps {
  adminUsers: any[];
}

const AdminUserStats: React.FC<AdminUserStatsProps> = ({ adminUsers }) => {
  const totalAdmins = adminUsers?.length || 0;
  const superAdmins = adminUsers?.filter(u => u.role === 'super_admin').length || 0;
  const activeUsers = adminUsers?.filter(u => u.is_active).length || 0;
  const inactiveUsers = adminUsers?.filter(u => !u.is_active).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Admins</CardTitle>
          <Shield className="w-4 h-4 text-dna-emerald" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{totalAdmins}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Super Admins</CardTitle>
          <Shield className="w-4 h-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{superAdmins}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          <Users className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Inactive Users</CardTitle>
          <Users className="w-4 h-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{inactiveUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserStats;

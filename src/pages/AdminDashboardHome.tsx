import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Users, User } from 'lucide-react';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';

const AdminDashboardHome = () => {
  const [adminInfo, setAdminInfo] = useState<{
    role: string;
    email: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (!user) return;

      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (adminError) {
          console.error('Error fetching admin info:', adminError);
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        setAdminInfo({
          role: adminData.role,
          email: profileData?.email || user.email || '',
          name: profileData?.full_name || 'Administrator'
        });
      } catch (err) {
        console.error('Error fetching admin info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'moderator':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Lock className="w-4 h-4" />;
      case 'admin':
        return <Users className="w-4 h-4" />;
      case 'moderator':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dna-emerald mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-dna-emerald to-dna-copper rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-dna-forest">DNA Admin</h1>
                  <p className="text-sm text-gray-600">Platform Administration</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {adminInfo && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
                      <p className="text-xs text-gray-500">{adminInfo.email}</p>
                    </div>
                    <Badge className={getRoleBadgeColor(adminInfo.role)}>
                      {getRoleIcon(adminInfo.role)}
                      <span className="ml-1 capitalize">{adminInfo.role}</span>
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to DNA Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Manage and monitor the Diaspora Network of Africa platform.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="w-5 h-5 text-dna-emerald" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-dna-copper" />
                  <span>Content Moderation</span>
                </CardTitle>
                <CardDescription>
                  Review and moderate platform content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="w-5 h-5 text-dna-gold" />
                  <span>Analytics</span>
                </CardTitle>
                <CardDescription>
                  View platform usage and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
              <CardDescription>
                Current platform status and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Admin portal is operational
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Admin authentication and role-based access control is active.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminAuthWrapper>
  );
};

export default AdminDashboardHome;
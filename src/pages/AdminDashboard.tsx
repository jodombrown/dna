
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Calendar, TrendingUp, Shield, Settings, History, BarChart3 } from 'lucide-react';
import RealTimeNotifications from '@/components/admin/RealTimeNotifications';
import AdvancedAnalyticsCharts from '@/components/admin/AdvancedAnalyticsCharts';

const AdminDashboard = () => {
  const { adminUser, loading, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges to access this dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminStats = [
    {
      title: "Total Users",
      value: "1,234",
      description: "Active platform members",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Posts Today",
      value: "89",
      description: "New posts created",
      icon: MessageSquare,
      color: "text-green-600"
    },
    {
      title: "Events This Week",
      value: "12",
      description: "Upcoming events",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Engagement Rate",
      value: "78%",
      description: "Weekly average",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Analytics Dashboard",
      description: "View platform analytics and insights",
      icon: TrendingUp,
      action: () => navigate('/admin/analytics'),
      roles: ['super_admin', 'analytics_viewer']
    },
    {
      title: "User Management",
      description: "Manage admin users and permissions",
      icon: Users,
      action: () => navigate('/admin/users'),
      roles: ['super_admin']
    },
    {
      title: "Role Management",
      description: "Manage user roles and permissions",
      icon: Shield,
      action: () => navigate('/admin/roles'),
      roles: ['super_admin']
    },
    {
      title: "Content Moderation",
      description: "Review flagged content and posts",
      icon: MessageSquare,
      action: () => navigate('/admin/moderation'),
      roles: ['super_admin', 'content_moderator']
    },
    {
      title: "Community Management",
      description: "Review and moderate communities",
      icon: Users,
      action: () => navigate('/admin/communities'),
      roles: ['super_admin', 'content_moderator']
    },
    {
      title: "Event Management",
      description: "Oversee community events",
      icon: Calendar,
      action: () => navigate('/admin/events'),
      roles: ['super_admin', 'event_manager']
    },
    {
      title: "Audit Log",
      description: "View admin activity and system logs",
      icon: History,
      action: () => navigate('/admin/audit-log'),
      roles: ['super_admin']
    },
    {
      title: "Advanced Settings",
      description: "Configure advanced platform settings",
      icon: Settings,
      action: () => navigate('/admin/advanced-settings'),
      roles: ['super_admin']
    },
    {
      title: "System Settings",
      description: "Basic platform configuration",
      icon: Settings,
      action: () => navigate('/admin/settings'),
      roles: ['super_admin']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-dna-emerald mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">DNA Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {adminUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RealTimeNotifications />
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Site
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-dna-emerald/10 text-dna-emerald">
            <Shield className="w-4 h-4 mr-1" />
            {adminUser?.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Advanced Analytics Charts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Overview
          </h3>
          <AdvancedAnalyticsCharts />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const hasAccess = action.roles.includes(adminUser?.role as any);
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`h-auto p-4 justify-start ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={hasAccess ? action.action : undefined}
                    disabled={!hasAccess}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-0.5 text-dna-emerald" />
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-gray-500">john.doe@example.com joined the platform</p>
                </div>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Content flagged for review</p>
                  <p className="text-xs text-gray-500">Post reported by multiple users</p>
                </div>
                <span className="text-xs text-gray-400">15 min ago</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Event approved</p>
                  <p className="text-xs text-gray-500">"Tech Talk: AI in Africa" event went live</p>
                </div>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

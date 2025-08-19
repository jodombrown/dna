import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Calendar, Settings, BarChart3, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, profiles, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate platform content',
      icon: Shield,
      path: '/admin/moderation',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    {
      title: 'Events Management',
      description: 'Oversee platform events and activities',
      icon: Calendar,
      path: '/admin/events',
      color: 'bg-green-50 text-green-600 border-green-200'
    },
    {
      title: 'Analytics',
      description: 'View platform metrics and insights',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and features',
      icon: Settings,
      path: '/admin/settings',
      color: 'bg-gray-50 text-gray-600 border-gray-200'
    },
    {
      title: 'Reports',
      description: 'Generate and view system reports',
      icon: FileText,
      path: '/admin/reports',
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dna-forest mb-2">
                Admin Console
              </h1>
              <p className="text-gray-600">
                Prelaunch testing and platform management
              </p>
            </div>
            <Button
              onClick={() => navigate('/dna')}
              variant="outline"
              className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
            >
              Go to Platform
            </Button>
          </div>
        </div>

        {/* Prelaunch Status */}
        <Card className="mb-8 border-dna-copper/20 bg-gradient-to-r from-dna-copper/5 to-dna-gold/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-dna-copper/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-dna-copper" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dna-forest">
                  Prelaunch Mode Active
                </h3>
                <p className="text-gray-600">
                  Platform is in testing phase. Public access opens September 1, 2025 at 9:00 AM PT.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200"
                onClick={() => navigate(section.path)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg border-2 ${section.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-dna-forest">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm">
                    {section.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-dna-forest">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => navigate('/dna')}
              >
                <div>
                  <div className="font-medium">Test Platform</div>
                  <div className="text-sm text-gray-500">Experience the full platform as an admin</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => navigate('/admin/diagnostics')}
              >
                <div>
                  <div className="font-medium">Run Diagnostics</div>
                  <div className="text-sm text-gray-500">Check system health and performance</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => window.open('https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok', '_blank')}
              >
                <div>
                  <div className="font-medium">Database Console</div>
                  <div className="text-sm text-gray-500">Access Supabase dashboard</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
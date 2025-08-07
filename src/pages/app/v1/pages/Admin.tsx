import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Archive, 
  AlertCircle, 
  Shield, 
  Database, 
  Users, 
  Activity,
  BarChart3,
  Settings,
  Lock
} from 'lucide-react';

const Admin = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Legacy Admin Header */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Admin Panel (v1)</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Read-Only Archive
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-700 text-sm mb-2">
                This is the archived v1 admin panel. All data and analytics are preserved for historical reference.
              </p>
              <p className="text-amber-600 text-xs">
                Active admin features and controls are available in the v2 platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <p className="text-xs text-gray-500 mt-1">v1 platform users</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sessions</CardTitle>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">0</div>
            <p className="text-xs text-gray-500 mt-1">archived system</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Database Size</CardTitle>
              <Database className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2.4GB</div>
            <p className="text-xs text-gray-500 mt-1">v1 archived data</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">ARCHIVED</div>
            <p className="text-xs text-gray-500 mt-1">read-only mode</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>User Management</span>
              <Lock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Archived user accounts, profiles, and permissions from v1 platform.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full text-gray-500">
              View Archive (Disabled)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
              <Lock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Historical analytics and usage metrics from v1 platform operations.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full text-gray-500">
              View Reports (Disabled)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <Database className="w-5 h-5" />
              <span>Data Management</span>
              <Lock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Archived database records, backups, and data exports from v1.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full text-gray-500">
              Export Data (Disabled)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <Settings className="w-5 h-5" />
              <span>System Settings</span>
              <Lock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Preserved system configuration and settings from v1 platform.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full text-gray-500">
              View Config (Disabled)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <Shield className="w-5 h-5" />
              <span>Security Logs</span>
              <Lock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Archived security events, audit trails, and access logs from v1.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full text-gray-500">
              View Logs (Disabled)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-600">
              <Activity className="w-5 h-5" />
              <span>Activity Monitor</span>
              <Lock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Historical user activity and engagement patterns from v1 era.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full text-gray-500">
              View Activity (Disabled)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Legacy System Information */}
      <Card>
        <CardHeader>
          <CardTitle>v1 Platform Archive Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Archive Contents</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Complete user database (1,247 accounts)</p>
                <p>• All posts and content (15,623 items)</p>
                <p>• Message history (89,234 messages)</p>
                <p>• Event records (567 events)</p>
                <p>• Community data (89 communities)</p>
                <p>• Analytics and metrics (24 months)</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Archive Status</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• ✅ Data integrity verified</p>
                <p>• ✅ Full backup completed</p>
                <p>• ✅ Read-only access enabled</p>
                <p>• ✅ Historical queries functional</p>
                <p>• ❌ Write operations disabled</p>
                <p>• ❌ Real-time features inactive</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Migration to v2 Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-blue-700 text-sm">
              All critical v1 data has been successfully migrated to the new v2 platform architecture.
              User accounts, connections, and essential content have been preserved and enhanced.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <p className="text-sm text-blue-700">User Data Migrated</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <p className="text-sm text-blue-700">Content Preserved</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <p className="text-sm text-blue-700">Relationships Maintained</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
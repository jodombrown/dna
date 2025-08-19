import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Database, Globe, Bell, Shield, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dna-forest mb-2">
                System Settings
              </h1>
              <p className="text-gray-600">
                Configure platform settings and features
              </p>
            </div>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configure basic platform settings and preferences
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Database</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Manage database settings and connections
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/ybhssuehmfnxrzneobok', '_blank')}
              >
                Open Console
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Domain & URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Configure domain settings and redirect URLs
              </p>
              <Button variant="outline" size="sm">Manage</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Set up email and push notification settings
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Manage security policies and authentication
              </p>
              <Button variant="outline" size="sm">Configure</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-dna-copper/10 rounded-lg flex items-center justify-center mb-3">
                <Palette className="w-6 h-6 text-dna-copper" />
              </div>
              <CardTitle className="text-lg">Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Customize platform branding and appearance
              </p>
              <Button variant="outline" size="sm">Customize</Button>
            </CardContent>
          </Card>
        </div>

        {/* Prelaunch Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Prelaunch Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-medium text-amber-900 mb-2">Launch Settings</h3>
                <p className="text-amber-700 text-sm mb-3">
                  Platform is currently in prelaunch mode. Public access opens September 1, 2025 at 9:00 AM PT.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Launch Config
                  </Button>
                  <Button variant="outline" size="sm">
                    Test Mode Settings
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Environment</h4>
                  <p className="text-sm text-gray-600 mb-2">Prelaunch Testing</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                    Testing Mode
                  </span>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Access Control</h4>
                  <p className="text-sm text-gray-600 mb-2">Admin Only</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    Restricted
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Settings, Shield, Database, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSystemSettings = () => {
  const { adminUser, loading, hasRole } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    siteName: 'Diaspora Network of Africa',
    siteDescription: 'Professional platform for the African Diaspora',
    allowUserRegistration: true,
    requireEmailVerification: true,
    enableContentModeration: true,
    maxFileUploadSize: '10',
    maintenanceMode: false,
    maintenanceMessage: '',
    supportEmail: 'support@diasporanetwork.africa',
    enableNotifications: true
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading system settings...</div>
      </div>
    );
  }

  if (!hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You need super admin privileges to access system settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin-dashboard')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // In a real implementation, this would save to the backend
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-dna-emerald" />
                <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Access
            </CardTitle>
            <CardDescription>User registration and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow User Registration</Label>
                <p className="text-sm text-gray-500">Allow new users to register accounts</p>
              </div>
              <Switch
                checked={settings.allowUserRegistration}
                onCheckedChange={(checked) => handleInputChange('allowUserRegistration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email Verification</Label>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Content Moderation</Label>
                <p className="text-sm text-gray-500">Automatically flag potentially inappropriate content</p>
              </div>
              <Switch
                checked={settings.enableContentModeration}
                onCheckedChange={(checked) => handleInputChange('enableContentModeration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* File & Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              File & Data Settings
            </CardTitle>
            <CardDescription>Upload limits and data management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
              <Input
                id="maxFileUploadSize"
                type="number"
                value={settings.maxFileUploadSize}
                onChange={(e) => handleInputChange('maxFileUploadSize', e.target.value)}
                className="mt-1"
                min="1"
                max="100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Push Notifications</Label>
                <p className="text-sm text-gray-500">Allow the platform to send push notifications to users</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleInputChange('enableNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>Temporarily disable the platform for maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Show maintenance page to all non-admin users</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
            </div>

            {settings.maintenanceMode && (
              <div>
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                  placeholder="We're currently performing maintenance. Please check back later."
                  className="mt-1"
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-dna-emerald hover:bg-dna-emerald/90">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;

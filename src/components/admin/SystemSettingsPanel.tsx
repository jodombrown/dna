
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Mail,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  platform_name: string;
  platform_description: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_notifications: boolean;
  auto_approve_communities: boolean;
  max_file_size_mb: number;
  support_email: string;
}

const SystemSettingsPanel: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    platform_name: 'Diaspora Network of Africa',
    platform_description: 'The professional platform for the African Diaspora to connect, collaborate, and contribute toward Africa\'s progress—together.',
    maintenance_mode: false,
    registration_enabled: true,
    email_notifications: true,
    auto_approve_communities: false,
    max_file_size_mb: 10,
    support_email: 'support@dnanetwork.africa'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here we would save to a system_config table or similar
      // For now, just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "System configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save system settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-dna-emerald" />
          <h2 className="text-2xl font-bold">System Settings</h2>
        </div>
        <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={config.platform_name}
                onChange={(e) => handleConfigChange('platform_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={config.support_email}
                onChange={(e) => handleConfigChange('support_email', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="platform-description">Platform Description</Label>
            <Textarea
              id="platform-description"
              value={config.platform_description}
              onChange={(e) => handleConfigChange('platform_description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            System Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Temporarily disable access to the platform</p>
            </div>
            <Switch
              checked={config.maintenance_mode}
              onCheckedChange={(checked) => handleConfigChange('maintenance_mode', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>User Registration</Label>
              <p className="text-sm text-gray-500">Allow new users to register</p>
            </div>
            <Switch
              checked={config.registration_enabled}
              onCheckedChange={(checked) => handleConfigChange('registration_enabled', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-approve Communities</Label>
              <p className="text-sm text-gray-500">Automatically approve new communities</p>
            </div>
            <Switch
              checked={config.auto_approve_communities}
              onCheckedChange={(checked) => handleConfigChange('auto_approve_communities', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">Send system notifications via email</p>
            </div>
            <Switch
              checked={config.email_notifications}
              onCheckedChange={(checked) => handleConfigChange('email_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            File Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
            <Input
              id="max-file-size"
              type="number"
              value={config.max_file_size_mb}
              onChange={(e) => handleConfigChange('max_file_size_mb', parseInt(e.target.value))}
              min="1"
              max="100"
            />
            <p className="text-sm text-gray-500 mt-1">Maximum allowed file size for uploads</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPanel;

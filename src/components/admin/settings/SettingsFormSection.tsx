import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save } from 'lucide-react';

interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
}

export function SettingsFormSection() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load platform settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === key 
        ? { ...setting, setting_value: value }
        : setting
    ));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ 
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', setting.setting_key);

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save platform settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (key: string) => {
    return settings.find(s => s.setting_key === key);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
      </div>
    );
  }

  const userManagementSettings = settings.filter(s => s.category === 'user_management');
  const contentSettings = settings.filter(s => s.category === 'content');
  const registrationSettings = settings.filter(s => s.category === 'registration');

  return (
    <div className="space-y-6">
      {/* User Management Settings */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userManagementSettings.map((setting) => (
            <div key={setting.setting_key} className="space-y-2">
              <Label htmlFor={setting.setting_key}>{setting.description}</Label>
              <Select
                value={getSetting(setting.setting_key)?.setting_value || 'user'}
                onValueChange={(value) => updateSetting(setting.setting_key, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentSettings.map((setting) => {
            const isBoolean = typeof setting.setting_value === 'boolean';
            
            return (
              <div key={setting.setting_key} className="space-y-2">
                <Label htmlFor={setting.setting_key}>{setting.description}</Label>
                {isBoolean ? (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={setting.setting_key}
                      checked={getSetting(setting.setting_key)?.setting_value || false}
                      onCheckedChange={(checked) => updateSetting(setting.setting_key, checked)}
                    />
                  </div>
                ) : (
                  <Input
                    id={setting.setting_key}
                    type="number"
                    value={getSetting(setting.setting_key)?.setting_value || ''}
                    onChange={(e) => updateSetting(setting.setting_key, parseInt(e.target.value) || 0)}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Registration & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {registrationSettings.map((setting) => (
            <div key={setting.setting_key} className="space-y-2">
              <Label htmlFor={setting.setting_key}>{setting.description}</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id={setting.setting_key}
                  checked={getSetting(setting.setting_key)?.setting_value || false}
                  onCheckedChange={(checked) => updateSetting(setting.setting_key, checked)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
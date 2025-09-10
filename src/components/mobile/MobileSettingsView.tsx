import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Trash2
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { supabase } from '@/integrations/supabase/client';

const MobileSettingsView = () => {
  const { signOut } = useAuth();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) throw error;
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account failed:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Personal Information', description: 'Update your profile details', action: () => {} },
        { label: 'Professional Details', description: 'Manage your work information', action: () => {} },
        { label: 'African Diaspora Identity', description: 'Share your heritage and background', action: () => {} },
        { label: 'Privacy Settings', description: 'Control who can see your information', action: () => {} }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { 
          label: 'Push Notifications', 
          description: 'Get notified about messages and updates',
          type: 'toggle',
          value: true,
          onChange: (value: boolean) => console.log('Push notifications:', value)
        },
        { 
          label: 'Email Notifications', 
          description: 'Receive updates via email',
          type: 'toggle',
          value: true,
          onChange: (value: boolean) => console.log('Email notifications:', value)
        },
        { 
          label: 'SMS Notifications', 
          description: 'Get important updates via SMS',
          type: 'toggle',
          value: false,
          onChange: (value: boolean) => console.log('SMS notifications:', value)
        }
      ]
    },
    {
      title: 'Preferences',
      icon: SettingsIcon,
      items: [
        { 
          label: 'Dark Mode', 
          description: 'Switch to dark theme',
          type: 'toggle',
          value: false,
          onChange: (value: boolean) => console.log('Dark mode:', value)
        },
        { label: 'Language', description: 'English', action: () => {} },
        { label: 'Time Zone', description: 'Auto-detect', action: () => {} }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Change Password', description: 'Update your account password', action: () => {} },
        { label: 'Two-Factor Authentication', description: 'Add extra security to your account', action: () => {} },
        { label: 'Connected Accounts', description: 'Manage linked social accounts', action: () => {} }
      ]
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        { label: 'Help Center', description: 'Find answers to common questions', action: () => {} },
        { label: 'Contact Support', description: 'Get help from our team', action: () => {} },
        { label: 'Report a Problem', description: 'Let us know about issues', action: () => {} },
        { label: 'Community Guidelines', description: 'Learn about our Ubuntu principles', action: () => {} },
        { label: 'About DNA', description: 'Learn more about our platform', action: () => {} }
      ]
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-6 border-b">
        <h1 className="text-2xl font-bold text-dna-forest">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Groups */}
      <div className="p-4 space-y-4">
        {settingsGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-dna-forest flex items-center">
                <group.icon className="w-5 h-5 mr-2" />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.items.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                  onClick={item.type === 'toggle' ? undefined : item.action}
                >
                  <div className="flex-1">
                    <p className="font-medium text-dna-forest">{item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  {item.type === 'toggle' ? (
                    <Switch
                      checked={item.value as boolean}
                      onCheckedChange={item.onChange as (value: boolean) => void}
                    />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Sign Out */}
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(true)}
              className="w-full justify-start p-4 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* App Info */}
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">DNA Platform</p>
        <p className="text-xs mt-1">© 2024 Diaspora Network of Africa</p>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Delete account"
        description="This will permanently delete your account and data. This action cannot be undone."
        confirmText={isDeleting ? 'Deleting…' : 'Delete'}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default MobileSettingsView;
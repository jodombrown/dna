import React from 'react';
import { useAdinPreferences, useUpdateAdinPreferences } from '@/hooks/useAdinPreferences';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, Bell, Mail, Smartphone, Clock, Globe, Users, MessageSquare, Heart, AtSign, Send, Calendar, BookOpen } from 'lucide-react';

// Common timezones for diaspora
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (UK)' },
  { value: 'Europe/Paris', label: 'Paris (France)' },
  { value: 'Europe/Berlin', label: 'Berlin (Germany)' },
  { value: 'Africa/Lagos', label: 'Lagos (Nigeria)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (Kenya)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (South Africa)' },
  { value: 'Africa/Cairo', label: 'Cairo (Egypt)' },
  { value: 'Africa/Accra', label: 'Accra (Ghana)' },
  { value: 'Africa/Addis_Ababa', label: 'Addis Ababa (Ethiopia)' },
  { value: 'Asia/Dubai', label: 'Dubai (UAE)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia)' },
];

const FREQUENCY_OPTIONS = [
  { value: 'high', label: 'High - Real-time notifications' },
  { value: 'normal', label: 'Normal - Regular frequency' },
  { value: 'low', label: 'Low - Batched updates' },
  { value: 'never', label: 'Never - No email notifications' },
];

const EMAIL_CATEGORIES = [
  { key: 'email_connections', label: 'Connections', description: 'New connection requests and acceptances', icon: Users },
  { key: 'email_comments', label: 'Comments', description: 'Comments on your posts', icon: MessageSquare },
  { key: 'email_reactions', label: 'Reactions & Likes', description: 'Reactions and likes on your content', icon: Heart },
  { key: 'email_mentions', label: 'Mentions', description: 'When someone mentions you', icon: AtSign },
  { key: 'email_messages', label: 'Messages', description: 'New direct messages', icon: Send },
  { key: 'email_events', label: 'Events', description: 'Event invites and reminders', icon: Calendar },
  { key: 'email_stories', label: 'Stories', description: 'New stories from your network', icon: BookOpen },
] as const;

export default function NotificationSettings() {
  const { data: preferences, isLoading } = useAdinPreferences();
  const { mutate: updatePreferences } = useUpdateAdinPreferences();

  const handleUpdate = (field: string, value: any) => {
    updatePreferences({ [field]: value });
  };

  if (isLoading || !preferences) {
    return (
      <SettingsLayout title="Notification Settings" description="Manage how and when you receive notifications">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Notification Settings"
      description="Manage how and when you receive notifications"
    >
      <div className="space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email_enabled" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="email_enabled"
                checked={preferences.email_enabled ?? true}
                onCheckedChange={(checked) => handleUpdate('email_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="in_app_enabled" className="text-base font-medium">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications within DNA
                  </p>
                </div>
              </div>
              <Switch
                id="in_app_enabled"
                checked={preferences.in_app_enabled ?? true}
                onCheckedChange={(checked) => handleUpdate('in_app_enabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Granular Email Preferences */}
        {preferences.email_enabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notification Types
              </CardTitle>
              <CardDescription>
                Choose which types of emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {EMAIL_CATEGORIES.map(({ key, label, description, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor={key} className="text-sm font-medium">
                        {label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={key}
                    checked={(preferences as any)[key] ?? true}
                    onCheckedChange={(checked) => handleUpdate(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Notification Frequency
            </CardTitle>
            <CardDescription>
              How often would you like to receive email notifications?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency">Email Frequency</Label>
                <Select
                  value={preferences.notification_frequency || 'realtime'}
                  onValueChange={(value) => handleUpdate('notification_frequency', value)}
                >
                  <SelectTrigger id="frequency" className="w-full md:w-64">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {preferences.notification_frequency === 'high' && 'You\'ll receive emails as events happen'}
                  {preferences.notification_frequency === 'normal' && 'You\'ll receive emails at regular intervals'}
                  {preferences.notification_frequency === 'low' && 'You\'ll receive batched email updates'}
                  {preferences.notification_frequency === 'never' && 'You won\'t receive any email notifications'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet_start">Start Time</Label>
                <Input
                  id="quiet_start"
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={(e) => handleUpdate('quiet_hours_start', e.target.value || null)}
                />
              </div>
              <div>
                <Label htmlFor="quiet_end">End Time</Label>
                <Input
                  id="quiet_end"
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={(e) => handleUpdate('quiet_hours_end', e.target.value || null)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Leave empty to receive notifications at any time
            </p>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Timezone
            </CardTitle>
            <CardDescription>
              Your timezone for scheduling notifications and quiet hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
              onValueChange={(value) => handleUpdate('timezone', value)}
            >
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
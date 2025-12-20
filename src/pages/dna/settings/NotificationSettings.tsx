import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { Loader2, Bell, Mail, Smartphone, Clock, Globe } from 'lucide-react';

interface AdinPreferences {
  id: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  notification_frequency: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
  // Granular email preferences
  email_connections: boolean;
  email_reactions: boolean;
  email_comments: boolean;
  email_messages: boolean;
  email_mentions: boolean;
  email_events: boolean;
  email_stories: boolean;
}

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
  { value: 'realtime', label: 'Real-time' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState<AdinPreferences | null>(null);

  // Fetch notification preferences
  const { data, isLoading } = useQuery({
    queryKey: ['adin-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('adin_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Return data or default values
      return data || {
        id: null,
        email_enabled: true,
        in_app_enabled: true,
        notification_frequency: 'realtime',
        quiet_hours_start: null,
        quiet_hours_end: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // Granular defaults
        email_connections: true,
        email_reactions: true,
        email_comments: true,
        email_messages: true,
        email_mentions: true,
        email_events: true,
        email_stories: true,
      };
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (data) {
      setPreferences(data as AdinPreferences);
    }
  }, [data]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<AdinPreferences>) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Upsert preferences
      const { error } = await supabase
        .from('adin_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adin-preferences', user?.id] });
      toast({ title: 'Preferences saved' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving preferences',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleUpdate = (field: keyof AdinPreferences, value: any) => {
    if (!preferences) return;

    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);

    // Debounced save
    updateMutation.mutate({ [field]: value });
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
                checked={preferences.email_enabled}
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
                checked={preferences.in_app_enabled}
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
              {[
                { key: 'email_connections', label: 'Connections', desc: 'Connection requests and acceptances' },
                { key: 'email_reactions', label: 'Reactions & Likes', desc: 'When someone reacts to your posts' },
                { key: 'email_comments', label: 'Comments', desc: 'When someone comments on your posts' },
                { key: 'email_messages', label: 'Messages', desc: 'Direct messages from other members' },
                { key: 'email_mentions', label: 'Mentions', desc: 'When someone @mentions you' },
                { key: 'email_events', label: 'Events', desc: 'Event reminders and updates' },
                { key: 'email_stories', label: 'Stories', desc: 'Story notifications from your network' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <Label htmlFor={key} className="text-sm font-medium">
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={preferences[key as keyof AdinPreferences] as boolean}
                    onCheckedChange={(checked) => handleUpdate(key as keyof AdinPreferences, checked)}
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
                  value={preferences.notification_frequency}
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
                  {preferences.notification_frequency === 'realtime' && 'You\'ll receive emails as events happen'}
                  {preferences.notification_frequency === 'daily' && 'You\'ll receive a summary email once per day'}
                  {preferences.notification_frequency === 'weekly' && 'You\'ll receive a summary email once per week'}
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
              value={preferences.timezone}
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

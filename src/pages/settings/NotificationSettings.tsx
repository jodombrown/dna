import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Smartphone, Moon, Clock } from 'lucide-react';
import { useAdinPreferences, useUpdateAdinPreferences } from '@/hooks/useAdinPreferences';
import SettingsLayout from './SettingsLayout';
import { Skeleton } from '@/components/ui/skeleton';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
];

const QUIET_HOURS = [
  { value: '22:00', label: '10:00 PM' },
  { value: '23:00', label: '11:00 PM' },
  { value: '00:00', label: '12:00 AM' },
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
];

export default function NotificationSettings() {
  const { data: preferences, isLoading } = useAdinPreferences();
  const { mutate: updatePreferences, isPending: isUpdating } = useUpdateAdinPreferences();
  
  const [localPrefs, setLocalPrefs] = useState({
    email_enabled: true,
    in_app_enabled: true,
    notification_frequency: 'normal' as 'never' | 'low' | 'normal' | 'high',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        email_enabled: preferences.email_enabled,
        in_app_enabled: preferences.in_app_enabled,
        notification_frequency: preferences.notification_frequency,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start || '22:00',
        quiet_hours_end: preferences.quiet_hours_end || '07:00',
        timezone: preferences.timezone || 'UTC',
      });
    }
  }, [preferences]);

  const handleUpdate = (updates: Partial<typeof localPrefs>) => {
    const newPrefs = { ...localPrefs, ...updates };
    setLocalPrefs(newPrefs);
    updatePreferences(newPrefs);
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-muted-foreground mt-1">Manage how and when you receive notifications</p>
        </div>

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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-toggle" className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch
                id="email-toggle"
                checked={localPrefs.email_enabled}
                onCheckedChange={(checked) => handleUpdate({ email_enabled: checked })}
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="inapp-toggle" className="font-medium">In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications within DNA</p>
                </div>
              </div>
              <Switch
                id="inapp-toggle"
                checked={localPrefs.in_app_enabled}
                onCheckedChange={(checked) => handleUpdate({ in_app_enabled: checked })}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Notification Frequency
            </CardTitle>
            <CardDescription>
              How often should we send you notifications?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={localPrefs.notification_frequency} 
              onValueChange={(value) => handleUpdate({ notification_frequency: value as typeof localPrefs.notification_frequency })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="high" id="high" />
                <div>
                  <Label htmlFor="high" className="font-medium cursor-pointer">High</Label>
                  <p className="text-sm text-muted-foreground">Get notified about everything immediately</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="normal" id="normal" />
                <div>
                  <Label htmlFor="normal" className="font-medium cursor-pointer">Normal (Recommended)</Label>
                  <p className="text-sm text-muted-foreground">Important updates and activity</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="low" id="low" />
                <div>
                  <Label htmlFor="low" className="font-medium cursor-pointer">Low</Label>
                  <p className="text-sm text-muted-foreground">Only critical notifications</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="never" id="never" />
                <div>
                  <Label htmlFor="never" className="font-medium cursor-pointer">Never</Label>
                  <p className="text-sm text-muted-foreground">Turn off all notifications</p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Pause notifications during certain hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="quiet-toggle" className="font-medium">Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">No notifications during specified times</p>
              </div>
              <Switch
                id="quiet-toggle"
                checked={localPrefs.quiet_hours_enabled}
                onCheckedChange={(checked) => handleUpdate({ quiet_hours_enabled: checked })}
                disabled={isUpdating}
              />
            </div>

            {localPrefs.quiet_hours_enabled && (
              <div className="grid gap-4 sm:grid-cols-3 p-4 rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select 
                    value={localPrefs.quiet_hours_start} 
                    onValueChange={(value) => handleUpdate({ quiet_hours_start: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUIET_HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select 
                    value={localPrefs.quiet_hours_end} 
                    onValueChange={(value) => handleUpdate({ quiet_hours_end: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUIET_HOURS.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={localPrefs.timezone} 
                    onValueChange={(value) => handleUpdate({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}

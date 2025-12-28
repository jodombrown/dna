import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDiaPreferences, useUpdateDiaPreferences } from '@/hooks/useDiaPreferences';
import { Loader2, Bell, BellOff, Mail, Smartphone, Moon, Users, MessageSquare, TrendingUp } from 'lucide-react';

export default function DiaPreferencesPage() {
  const { data: preferences, isLoading } = useDiaPreferences();
  const updatePreferences = useUpdateDiaPreferences();

  const [localPrefs, setLocalPrefs] = useState({
    notification_frequency: preferences?.notification_frequency || 'normal',
    nudge_categories: preferences?.nudge_categories || ['connection', 'content', 'engagement'],
    email_enabled: preferences?.email_enabled ?? true,
    in_app_enabled: preferences?.in_app_enabled ?? true,
    quiet_hours_enabled: preferences?.quiet_hours_enabled ?? false,
    quiet_hours_start: preferences?.quiet_hours_start || '22:00',
    quiet_hours_end: preferences?.quiet_hours_end || '08:00',
  });

  // Update local state when preferences load
  useState(() => {
    if (preferences) {
      setLocalPrefs({
        notification_frequency: preferences.notification_frequency,
        nudge_categories: preferences.nudge_categories,
        email_enabled: preferences.email_enabled,
        in_app_enabled: preferences.in_app_enabled,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end,
      });
    }
  });

  const handleSave = () => {
    updatePreferences.mutate(localPrefs);
  };

  const toggleCategory = (category: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      nudge_categories: prev.nudge_categories.includes(category)
        ? prev.nudge_categories.filter(c => c !== category)
        : [...prev.nudge_categories, category],
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">DIA Preferences</h1>
        <p className="text-muted-foreground">
          Customize how DIA keeps you engaged with the DNA community
        </p>
      </div>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            How often should DIA send you engagement nudges?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={localPrefs.notification_frequency}
            onValueChange={(value) => setLocalPrefs(prev => ({ ...prev, notification_frequency: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">
                <div className="flex items-center gap-2">
                  <BellOff className="h-4 w-4" />
                  Never - No nudges
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Low - Only critical nudges
                </div>
              </SelectItem>
              <SelectItem value="normal">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Normal - Balanced nudges
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  High - All engagement nudges
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Nudge Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Nudge Categories</CardTitle>
          <CardDescription>
            Choose which types of nudges you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="connection" className="font-medium">Connection Nudges</Label>
                <p className="text-sm text-muted-foreground">Pending requests, weak connections, networking opportunities</p>
              </div>
            </div>
            <Checkbox
              id="connection"
              checked={localPrefs.nudge_categories.includes('connection')}
              onCheckedChange={() => toggleCategory('connection')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="content" className="font-medium">Content Nudges</Label>
                <p className="text-sm text-muted-foreground">Post suggestions, popular topics, community highlights</p>
              </div>
            </div>
            <Checkbox
              id="content"
              checked={localPrefs.nudge_categories.includes('content')}
              onCheckedChange={() => toggleCategory('content')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="engagement" className="font-medium">Engagement Nudges</Label>
                <p className="text-sm text-muted-foreground">Profile completion, activity reminders, milestone celebrations</p>
              </div>
            </div>
            <Checkbox
              id="engagement"
              checked={localPrefs.nudge_categories.includes('engagement')}
              onCheckedChange={() => toggleCategory('engagement')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive nudges via email</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={localPrefs.email_enabled}
              onCheckedChange={(checked) => setLocalPrefs(prev => ({ ...prev, email_enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="inapp" className="font-medium">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">See nudges in your DNA dashboard</p>
              </div>
            </div>
            <Switch
              id="inapp"
              checked={localPrefs.in_app_enabled}
              onCheckedChange={(checked) => setLocalPrefs(prev => ({ ...prev, in_app_enabled: checked }))}
            />
          </div>
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
            Pause notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
            <Switch
              id="quiet-hours"
              checked={localPrefs.quiet_hours_enabled}
              onCheckedChange={(checked) => setLocalPrefs(prev => ({ ...prev, quiet_hours_enabled: checked }))}
            />
          </div>

          {localPrefs.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <input
                  id="start-time"
                  type="time"
                  value={localPrefs.quiet_hours_start}
                  onChange={(e) => setLocalPrefs(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <input
                  id="end-time"
                  type="time"
                  value={localPrefs.quiet_hours_end}
                  onChange={(e) => setLocalPrefs(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={updatePreferences.isPending}>
          {updatePreferences.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

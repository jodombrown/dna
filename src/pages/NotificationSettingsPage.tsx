import BaseLayout from '@/layouts/BaseLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Heart, AtSign, Users, Calendar, BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDiaPreferences, useUpdateDiaPreferences } from '@/hooks/useDiaPreferences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const NotificationToggle = ({ id, label, description, icon, checked, onCheckedChange, disabled }: NotificationToggleProps) => (
  <div className="flex items-start justify-between py-4">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const { data: preferences, isLoading } = useDiaPreferences();
  const updatePreferences = useUpdateDiaPreferences();

  const handleToggle = (field: string, value: boolean) => {
    updatePreferences.mutate({ [field]: value });
  };

  const handleFrequencyChange = (value: string) => {
    updatePreferences.mutate({ notification_frequency: value as 'never' | 'low' | 'normal' | 'high' });
  };

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BaseLayout>
    );
  }

  const emailEnabled = preferences?.email_enabled ?? true;

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications from DNA Platform
          </p>
        </div>

        {/* Master Email Toggle */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {emailEnabled ? 'Receiving email notifications' : 'All email notifications are off'}
                </p>
              </div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>

          {emailEnabled && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Notification Frequency</Label>
                  <p className="text-xs text-muted-foreground">How often you want to receive emails</p>
                </div>
                <Select
                  value={preferences?.notification_frequency || 'normal'}
                  onValueChange={handleFrequencyChange}
                  disabled={updatePreferences.isPending}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Immediate</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Reduced</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </Card>

        {/* Granular Email Controls */}
        <Card className={`p-6 ${!emailEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Email Notification Types</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose which types of notifications you want to receive via email
          </p>

          <div className="divide-y">
            <NotificationToggle
              id="email_connections"
              label="Connections"
              description="Connection requests and acceptances"
              icon={<Users className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_connections ?? true}
              onCheckedChange={(checked) => handleToggle('email_connections', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />

            <NotificationToggle
              id="email_comments"
              label="Comments"
              description="When someone comments on your posts"
              icon={<MessageSquare className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_comments ?? true}
              onCheckedChange={(checked) => handleToggle('email_comments', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />

            <NotificationToggle
              id="email_reactions"
              label="Reactions & Likes"
              description="When someone reacts to your content"
              icon={<Heart className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_reactions ?? true}
              onCheckedChange={(checked) => handleToggle('email_reactions', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />

            <NotificationToggle
              id="email_mentions"
              label="Mentions"
              description="When someone mentions you in a post or comment"
              icon={<AtSign className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_mentions ?? true}
              onCheckedChange={(checked) => handleToggle('email_mentions', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />

            <NotificationToggle
              id="email_messages"
              label="Messages"
              description="New direct messages from connections"
              icon={<Mail className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_messages ?? true}
              onCheckedChange={(checked) => handleToggle('email_messages', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />

            <NotificationToggle
              id="email_events"
              label="Events"
              description="Event invitations and reminders"
              icon={<Calendar className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_events ?? true}
              onCheckedChange={(checked) => handleToggle('email_events', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />

            <NotificationToggle
              id="email_stories"
              label="Stories"
              description="When connections publish new stories"
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              checked={(preferences as any)?.email_stories ?? true}
              onCheckedChange={(checked) => handleToggle('email_stories', checked)}
              disabled={updatePreferences.isPending || !emailEnabled}
            />
          </div>
        </Card>

        {/* In-App Notifications */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">In-App Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Show notifications within the platform
                </p>
              </div>
            </div>
            <Switch
              checked={preferences?.in_app_enabled ?? true}
              onCheckedChange={(checked) => handleToggle('in_app_enabled', checked)}
              disabled={updatePreferences.isPending}
            />
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/dna/notifications')}
          >
            <Bell className="h-4 w-4 mr-2" />
            View Notifications
          </Button>
        </div>
      </div>
    </BaseLayout>
  );
}

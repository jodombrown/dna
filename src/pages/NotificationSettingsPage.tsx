import BaseLayout from '@/layouts/BaseLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationSettingsPage() {
  const navigate = useNavigate();

  return (
    <BaseLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications from DNA Platform
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Notification Preferences Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              We're working on building granular notification controls. For now, you'll receive all important notifications.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/dna/notifications')}
              className="mt-4"
            >
              <Bell className="h-4 w-4 mr-2" />
              View Notifications
            </Button>
          </div>
        </Card>
      </div>
    </BaseLayout>
  );
}

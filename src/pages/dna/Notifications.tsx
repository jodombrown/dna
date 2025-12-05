import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const DnaNotifications = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">Notifications feed coming soon...</p>
        </Card>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default DnaNotifications;

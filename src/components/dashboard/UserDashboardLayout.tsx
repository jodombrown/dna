import React from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/services/profilesService';
import { useMobile } from '@/hooks/useMobile';
import UnifiedHeader from '@/components/UnifiedHeader';

import DashboardLeftColumn from './DashboardLeftColumn';
import DashboardCenterColumn from './DashboardCenterColumn';
import DashboardRightColumn from './DashboardRightColumn';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

interface UserDashboardLayoutProps {
  profile: Profile;
  currentUser: User;
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({
  profile,
  currentUser
}) => {
  const { isMobile } = useMobile();
  const isOwnProfile = currentUser.id === profile.id;

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="pt-5 pb-20 lg:pb-0 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-5rem)]">
          {isMobile ? (
            // Mobile: Single column layout, stacked - optimized spacing
            <div className="space-y-3 pt-1 px-3 overflow-y-auto h-full">
              <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
            </div>
          ) : (
            // Desktop: 3-column layout with independent scrolling - minimal padding
            <div className="flex h-full">
              {/* Left Column - 15% */}
              <div className="w-[15%] flex-shrink-0 overflow-y-auto border-r border-border px-1.5 pt-1 pb-4">
                <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
              
              {/* Center Column - 70% */}
              <div className="w-[70%] flex-shrink-0 overflow-y-auto px-6 pt-1 pb-4">
                <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
              
              {/* Right Column - 15% */}
              <div className="w-[15%] flex-shrink-0 overflow-y-auto border-l border-border px-1.5 pt-1 pb-4">
                <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default UserDashboardLayout;
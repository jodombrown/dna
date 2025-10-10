import React from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/services/profilesService';
import { useMobile } from '@/hooks/useMobile';
import UnifiedHeader from '@/components/UnifiedHeader';

import DashboardLeftColumn from './DashboardLeftColumn';
import DashboardCenterColumn from './DashboardCenterColumn';
import DashboardRightColumn from './DashboardRightColumn';

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
      
      <main className="pt-16 pb-20 lg:pb-0 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-4rem)]">
          {isMobile ? (
            // Mobile: Single column layout, stacked
            <div className="space-y-6 py-6 px-4 overflow-y-auto h-full">
              <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
            </div>
          ) : (
            // Desktop: 3-column layout with independent scrolling and margins
            <div className="flex h-full">
              {/* Left Column - 15% */}
              <div className="w-[15%] flex-shrink-0 overflow-y-auto border-r border-border px-6 py-6">
                <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
              
              {/* Center Column - 70% */}
              <div className="w-[70%] flex-shrink-0 overflow-y-auto px-6 py-6">
                <div className="max-w-2xl mx-auto">
                  <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
                </div>
              </div>
              
              {/* Right Column - 15% */}
              <div className="w-[15%] flex-shrink-0 overflow-y-auto border-l border-border px-6 py-6">
                <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboardLayout;
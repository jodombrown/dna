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
      
      <main className="pt-16 pb-20 lg:pb-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {isMobile ? (
            // Mobile: Single column layout, stacked
            <div className="space-y-6 py-6">
              <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
            </div>
          ) : (
            // Desktop: 3-column layout (25%-50%-25%)
            <div className="grid grid-cols-12 gap-6 py-6">
              {/* Left Column - 25% (3/12) */}
              <div className="col-span-3">
                <div className="sticky top-6">
                  <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
                </div>
              </div>
              
              {/* Center Column - 50% (6/12) */}
              <div className="col-span-6">
                <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
              
              {/* Right Column - 25% (3/12) */}
              <div className="col-span-3">
                <div className="sticky top-6">
                  <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboardLayout;
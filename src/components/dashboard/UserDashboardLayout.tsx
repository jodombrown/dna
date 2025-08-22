import React from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/services/profilesService';
import { useMobile } from '@/hooks/useMobile';
import UnifiedHeader from '@/components/UnifiedHeader';
import { MobileNavigation } from '@/components/mobile';
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
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      
      <main className="pt-16 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isMobile ? (
            // Mobile: Single column layout, stacked
            <div className="space-y-6 py-6">
              <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
            </div>
          ) : (
            // Desktop: 3-column layout (25%-50%-25%)
            <div className="grid grid-cols-4 gap-6 py-6">
              {/* Left Column - 25% (1/4) */}
              <div className="col-span-1">
                <DashboardLeftColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
              
              {/* Center Column - 50% (2/4) */}
              <div className="col-span-2">
                <DashboardCenterColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
              
              {/* Right Column - 25% (1/4) */}
              <div className="col-span-1">
                <DashboardRightColumn profile={profile} isOwnProfile={isOwnProfile} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default UserDashboardLayout;
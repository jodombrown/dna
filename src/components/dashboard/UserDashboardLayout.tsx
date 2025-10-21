import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/services/profilesService';
import { useMobile } from '@/hooks/useMobile';
import UnifiedHeader from '@/components/UnifiedHeader';
import ProfileHeroSection from '@/components/profile/ProfileHeroSection';
import { AvatarUploadModal } from '@/components/profile/AvatarUploadModal';
import { BannerUploadModal } from '@/components/profile/BannerUploadModal';

import DashboardLeftColumn from './DashboardLeftColumn';
import DashboardCenterColumn from './DashboardCenterColumn';
import DashboardRightColumn from './DashboardRightColumn';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { useNavigate } from 'react-router-dom';

interface UserDashboardLayoutProps {
  profile: Profile;
  currentUser: User;
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({
  profile,
  currentUser
}) => {
  const { isMobile, isTablet, isDesktop } = useMobile();
  const navigate = useNavigate();
  const isOwnProfile = currentUser.id === profile.id;
  
  // Modal states
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  
  // Use stacked layout for mobile AND tablet
  const useStackedLayout = isMobile || isTablet;

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="pt-5 pb-20 lg:pb-0 overflow-hidden">
        {/* Profile Hero Section */}
        <div className="px-4 md:px-8 pb-4">
          <ProfileHeroSection
            profile={profile}
            isOwnProfile={isOwnProfile}
            onEdit={() => navigate('/app/profile/edit')}
            bannerType={(profile.banner_type as 'gradient' | 'solid' | 'image') || 'gradient'}
            bannerGradient={profile.banner_gradient || 'dna'}
            bannerUrl={profile.banner_url}
            bannerOverlay={profile.banner_overlay || false}
            onEditBanner={isOwnProfile ? () => setBannerModalOpen(true) : undefined}
            onEditAvatar={isOwnProfile ? () => setAvatarModalOpen(true) : undefined}
          />
        </div>

        <div className="w-full h-[calc(100vh-5rem)]">
          {useStackedLayout ? (
            // Mobile & Tablet: Single column layout, stacked
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

      {/* Avatar & Banner Upload Modals */}
      {isOwnProfile && (
        <>
          <AvatarUploadModal
            open={avatarModalOpen}
            onOpenChange={setAvatarModalOpen}
            currentAvatarUrl={profile.avatar_url}
            userId={profile.id}
            onUploadComplete={() => window.location.reload()}
          />

          <BannerUploadModal
            open={bannerModalOpen}
            onOpenChange={setBannerModalOpen}
            userId={profile.id}
            currentBanner={{
              type: (profile.banner_type as 'gradient' | 'solid' | 'image') || 'gradient',
              value: profile.banner_type === 'image' ? profile.banner_url : (profile.banner_gradient || 'dna'),
              overlay: profile.banner_overlay || false
            }}
            onUploadComplete={() => window.location.reload()}
          />
        </>
      )}
    </div>
  );
};

export default UserDashboardLayout;
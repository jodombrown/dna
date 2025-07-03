
import React, { useState } from 'react';
import LinkedInStyleProfileHeader from './LinkedInStyleProfileHeader';
import DNAProfileSidebar from './DNAProfileSidebar';
import DNAProfileTabs from './DNAProfileTabs';
import FollowButton from '@/components/FollowButton';
import { useProfileContent } from '@/hooks/useProfileContent';
import { useAuth } from '@/contexts/CleanAuthContext';

interface DNALinkedInProfileProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

const DNALinkedInProfile: React.FC<DNALinkedInProfileProps> = ({
  profile,
  isOwnProfile,
  onEdit,
  onFollow,
  onMessage
}) => {
  const [activeTab, setActiveTab] = useState('about');
  const { user } = useAuth();
  const { userPosts, userEvents, userCommunities } = useProfileContent(profile?.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <LinkedInStyleProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onFollow={onFollow}
        onMessage={onMessage}
      />

      {/* Follow Button Section - Show when viewing other user's profile */}
      {!isOwnProfile && user && profile?.id && (
        <div className="flex justify-center">
          <FollowButton 
            targetType="user" 
            targetId={profile.id} 
            size="lg"
            className="shadow-sm"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <DNAProfileSidebar
          profile={profile}
          isOwnProfile={isOwnProfile}
        />

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <DNAProfileTabs
            profile={profile}
            isOwnProfile={isOwnProfile}
            userPosts={userPosts}
            userEvents={userEvents}
            userCommunities={userCommunities}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default DNALinkedInProfile;

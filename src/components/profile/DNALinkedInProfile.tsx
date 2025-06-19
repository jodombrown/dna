
import React, { useState } from 'react';
import LinkedInStyleProfileHeader from './LinkedInStyleProfileHeader';
import DNAProfileSidebar from './DNAProfileSidebar';
import DNAProfileTabs from './DNAProfileTabs';
import { useProfileContent } from '@/hooks/useProfileContent';

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

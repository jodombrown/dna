
import React from 'react';
import DNAQuickStatsCard from './DNAQuickStatsCard';
import DNARecentActivityCard from './DNARecentActivityCard';

interface DNAProfileSidebarProps {
  profile: any;
  userPosts: any[];
  userEvents: any[];
  isOwnProfile: boolean;
}

const DNAProfileSidebar: React.FC<DNAProfileSidebarProps> = ({
  profile,
  userPosts,
  userEvents,
  isOwnProfile
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <DNAQuickStatsCard 
        profile={profile}
        userPosts={userPosts}
        userEvents={userEvents}
      />
      
      <DNARecentActivityCard 
        userPosts={userPosts}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
};

export default DNAProfileSidebar;

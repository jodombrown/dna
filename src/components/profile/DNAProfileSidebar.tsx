
import React from 'react';
import DNAQuickStatsCard from './DNAQuickStatsCard';
import SuggestedConnectionsSection from './SuggestedConnectionsSection';

interface DNAProfileSidebarProps {
  profile: any;
  isOwnProfile: boolean;
}

const DNAProfileSidebar: React.FC<DNAProfileSidebarProps> = ({
  profile,
  isOwnProfile
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <DNAQuickStatsCard 
        profile={profile}
      />
      
      {!isOwnProfile && (
        <SuggestedConnectionsSection />
      )}
    </div>
  );
};

export default DNAProfileSidebar;

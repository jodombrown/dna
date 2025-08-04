import React, { useState } from 'react';
import { SocialFeed } from '@/components/feed/SocialFeed';
import { EnhancedPostComposer } from '@/components/feed/EnhancedPostComposer';

const CommunityFeed = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    // Trigger a refresh of the feed
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <EnhancedPostComposer 
        defaultPillar="connect" 
        onPostCreated={handlePostCreated}
      />
      <SocialFeed 
        key={refreshKey}
        pillar="feed" 
        limit={10} 
      />
    </div>
  );
};

export default CommunityFeed;
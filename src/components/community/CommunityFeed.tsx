import React, { useState } from 'react';
import { Feed } from '@/components/feed/Feed';
import { PostComposer } from '@/components/feed/PostComposer';

const CommunityFeed = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    // Trigger a refresh of the feed
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <PostComposer 
        defaultPillar="connect" 
        onPostCreated={handlePostCreated}
      />
      <Feed 
        key={refreshKey}
        pillar="feed" 
        limit={10} 
      />
    </div>
  );
};

export default CommunityFeed;
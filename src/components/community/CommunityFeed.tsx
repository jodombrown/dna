import React from 'react';
import { FeedContainer } from '@/components/social-feed/FeedContainer';

const CommunityFeed = () => {
  return (
    <FeedContainer 
      defaultPillar="connect"
      showComposer={true}
    />
  );
};

export default CommunityFeed;
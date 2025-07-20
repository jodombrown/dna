import React from 'react';
import CommunityDiscovery from '@/components/community/CommunityDiscovery';

interface CommunitiesTabProps {
  searchTerm: string;
}

const CommunitiesTab: React.FC<CommunitiesTabProps> = ({ searchTerm }) => {
  return <CommunityDiscovery />;
};

export default CommunitiesTab;
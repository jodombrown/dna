
import { useState, useEffect } from 'react';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined?: boolean;
}

export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'African Tech Professionals',
      description: 'Connecting African tech professionals worldwide for collaboration and knowledge sharing.',
      memberCount: 1250,
      category: 'Technology',
      isJoined: false
    },
    {
      id: '2',
      name: 'Women in African Business',
      description: 'Empowering African women entrepreneurs and business leaders.',
      memberCount: 850,
      category: 'Business',
      isJoined: false
    },
    {
      id: '3',
      name: 'African Healthcare Innovation',
      description: 'Advancing healthcare solutions across the African continent.',
      memberCount: 420,
      category: 'Healthcare',
      isJoined: false
    },
    {
      id: '4',
      name: 'Sustainable Agriculture Network',
      description: 'Promoting sustainable farming practices and food security in Africa.',
      memberCount: 680,
      category: 'Agriculture',
      isJoined: false
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCommunities(mockCommunities);
      setLoading(false);
    }, 1000);
  }, []);

  const createCommunity = async (communityData: Partial<Community>) => {
    // Simulate community creation
    const newCommunity: Community = {
      id: Date.now().toString(),
      name: communityData.name || '',
      description: communityData.description || '',
      memberCount: 1,
      category: communityData.category || 'General',
      isJoined: true
    };
    
    setCommunities(prev => [...prev, newCommunity]);
    return newCommunity;
  };

  const joinCommunity = async (communityId: string) => {
    setCommunities(prev =>
      prev.map(community =>
        community.id === communityId
          ? { ...community, isJoined: true, memberCount: community.memberCount + 1 }
          : community
      )
    );
  };

  const leaveCommunity = async (communityId: string) => {
    setCommunities(prev =>
      prev.map(community =>
        community.id === communityId
          ? { ...community, isJoined: false, memberCount: Math.max(0, community.memberCount - 1) }
          : community
      )
    );
  };

  return {
    communities,
    loading,
    createCommunity,
    joinCommunity,
    leaveCommunity
  };
};

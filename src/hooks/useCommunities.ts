
import { useState, useEffect } from 'react';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined?: boolean;
  is_member?: boolean;
  created_by?: string;
  creator_id?: string;
  member_count?: number;
  is_featured?: boolean;
  is_active?: boolean;
  moderation_status?: string;
  moderated_at?: string;
  moderated_by?: string;
  created_at?: string;
  updated_at?: string;
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
      member_count: 1250,
      category: 'Technology',
      isJoined: false,
      is_member: false,
      created_by: 'user1',
      creator_id: 'user1',
      is_featured: true,
      is_active: true,
      moderation_status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Women in African Business',
      description: 'Empowering African women entrepreneurs and business leaders.',
      memberCount: 850,
      member_count: 850,
      category: 'Business',
      isJoined: false,
      is_member: false,
      created_by: 'user2',
      creator_id: 'user2',
      is_featured: false,
      is_active: true,
      moderation_status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'African Healthcare Innovation',
      description: 'Advancing healthcare solutions across the African continent.',
      memberCount: 420,
      member_count: 420,
      category: 'Healthcare',
      isJoined: false,
      is_member: false,
      created_by: 'user3',
      creator_id: 'user3',
      is_featured: false,
      is_active: true,
      moderation_status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Sustainable Agriculture Network',
      description: 'Promoting sustainable farming practices and food security in Africa.',
      memberCount: 680,
      member_count: 680,
      category: 'Agriculture',
      isJoined: false,
      is_member: false,
      created_by: 'user4',
      creator_id: 'user4',
      is_featured: false,
      is_active: true,
      moderation_status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
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
      member_count: 1,
      category: communityData.category || 'General',
      isJoined: true,
      is_member: true,
      created_by: 'current-user',
      creator_id: 'current-user',
      is_featured: false,
      is_active: true,
      moderation_status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setCommunities(prev => [...prev, newCommunity]);
    return newCommunity;
  };

  const joinCommunity = async (communityId: string) => {
    setCommunities(prev =>
      prev.map(community =>
        community.id === communityId
          ? { 
              ...community, 
              isJoined: true, 
              is_member: true, 
              memberCount: community.memberCount + 1,
              member_count: (community.member_count || 0) + 1
            }
          : community
      )
    );
  };

  const leaveCommunity = async (communityId: string) => {
    setCommunities(prev =>
      prev.map(community =>
        community.id === communityId
          ? { 
              ...community, 
              isJoined: false, 
              is_member: false, 
              memberCount: Math.max(0, community.memberCount - 1),
              member_count: Math.max(0, (community.member_count || 0) - 1)
            }
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

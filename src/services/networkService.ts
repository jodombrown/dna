import { supabase } from '@/integrations/supabase/client';

export interface NetworkConnection {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string | null;
  pillar: string;
  mutualConnections: number;
  status: 'connected' | 'pending' | 'received';
}

export interface NetworkCommunity {
  id: string;
  name: string;
  members: number;
  description: string;
  category: string;
  joinedAt?: string;
}

export const networkService = {
  // Fetch user's connections (accepted contact requests)
  async getConnections(userId: string): Promise<NetworkConnection[]> {
    const { data, error } = await supabase
      .from('contact_requests')
      .select(`
        id,
        status,
        created_at,
        sender_id,
        receiver_id
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }

    if (!data) return [];

    // Get profile data for all connected users
    const userIds = data.map(request => 
      request.sender_id === userId ? request.receiver_id : request.sender_id
    );

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, professional_role, location, avatar_url, industry')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    return data.map(request => {
      const otherUserId = request.sender_id === userId ? request.receiver_id : request.sender_id;
      const profile = profiles?.find(p => p.id === otherUserId);
      
      return {
        id: otherUserId,
        name: profile?.full_name || 'Unknown User',
        role: profile?.professional_role || 'Professional',
        location: profile?.location || 'Location not set',
        avatar: profile?.avatar_url || null,
        pillar: 'Connect',
        mutualConnections: 0, // TODO: Calculate mutual connections
        status: 'connected' as const
      };
    });
  },

  // Fetch pending connection requests
  async getPendingRequests(userId: string): Promise<NetworkConnection[]> {
    const { data, error } = await supabase
      .from('contact_requests')
      .select(`
        id,
        status,
        message,
        created_at,
        sender_id,
        receiver_id
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }

    if (!data) return [];

    // Get profile data for all pending users
    const userIds = data.map(request => 
      request.sender_id === userId ? request.receiver_id : request.sender_id
    );

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, professional_role, location, avatar_url, industry')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    return data.map(request => {
      const isReceived = request.receiver_id === userId;
      const otherUserId = isReceived ? request.sender_id : request.receiver_id;
      const profile = profiles?.find(p => p.id === otherUserId);
      
      return {
        id: otherUserId,
        name: profile?.full_name || 'Unknown User',
        role: profile?.professional_role || 'Professional',
        location: profile?.location || 'Location not set',
        avatar: profile?.avatar_url || null,
        pillar: 'Connect',
        mutualConnections: 0,
        status: isReceived ? 'received' as const : 'pending' as const
      };
    });
  },

  // Fetch user's followers
  async getFollowers(userId: string): Promise<NetworkConnection[]> {
    const { data, error } = await supabase
      .from('user_connections')
      .select(`
        id,
        created_at,
        follower:follower_id(
          id,
          profiles(
            full_name,
            professional_role,
            location,
            avatar_url,
            industry
          )
        )
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Error fetching followers:', error);
      return [];
    }

    return data?.map(connection => {
      const profile = connection.follower?.profiles;
      
      return {
        id: connection.follower?.id || '',
        name: profile?.full_name || 'Unknown User',
        role: profile?.professional_role || 'Professional',
        location: profile?.location || 'Location not set',
        avatar: profile?.avatar_url || null,
        pillar: 'Connect',
        mutualConnections: 0,
        status: 'connected' as const
      };
    }) || [];
  },

  // Fetch users that the current user is following
  async getFollowing(userId: string): Promise<NetworkConnection[]> {
    const { data, error } = await supabase
      .from('user_connections')
      .select(`
        id,
        created_at,
        following:following_id(
          id,
          profiles(
            full_name,
            professional_role,
            location,
            avatar_url,
            industry
          )
        )
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Error fetching following:', error);
      return [];
    }

    return data?.map(connection => {
      const profile = connection.following?.profiles;
      
      return {
        id: connection.following?.id || '',
        name: profile?.full_name || 'Unknown User',
        role: profile?.professional_role || 'Professional',
        location: profile?.location || 'Location not set',
        avatar: profile?.avatar_url || null,
        pillar: 'Connect',
        mutualConnections: 0,
        status: 'connected' as const
      };
    }) || [];
  },

  // Fetch user's communities
  async getCommunities(userId: string): Promise<NetworkCommunity[]> {
    const { data, error } = await supabase
      .from('community_memberships')
      .select(`
        id,
        joined_at,
        community:community_id(
          id,
          name,
          description,
          category,
          member_count
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching communities:', error);
      return [];
    }

    return data?.map(membership => ({
      id: membership.community?.id || '',
      name: membership.community?.name || 'Unknown Community',
      members: membership.community?.member_count || 0,
      description: membership.community?.description || '',
      category: membership.community?.category || 'General',
      joinedAt: membership.joined_at
    })) || [];
  },

  // Get network counts
  async getNetworkCounts(userId: string) {
    const [connections, pending, followers, following, communities] = await Promise.all([
      this.getConnections(userId),
      this.getPendingRequests(userId),
      this.getFollowers(userId),
      this.getFollowing(userId),
      this.getCommunities(userId)
    ]);

    return {
      connections: connections.length,
      followers: followers.length + following.length,
      communities: communities.length,
      events: 0, // TODO: Implement events
      initiatives: 0, // TODO: Implement initiatives
      newsletters: 0 // TODO: Implement newsletters
    };
  }
};
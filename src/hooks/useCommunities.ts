import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Community, CommunityMembership, CommunityWithMembership, CreateCommunityData } from '@/types/community';

export const useCommunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<CommunityWithMembership[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      let communitiesQuery = supabase
        .from('communities')
        .select('*')
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      const { data: communitiesData, error: communitiesError } = await communitiesQuery;
      
      if (communitiesError) throw communitiesError;

      if (!user || !communitiesData) {
        const communitiesWithMembership: CommunityWithMembership[] = (communitiesData || []).map(community => ({
          ...community,
          creator_id: community.created_by || '',
          is_active: true, // Default value instead of accessing community.is_active
          is_member: false,
          user_membership: undefined,
          user_role: undefined
        }));
        setCommunities(communitiesWithMembership);
        return;
      }

      // Fetch user memberships using a direct query to community_memberships table
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('community_memberships' as any)
        .select('*')
        .eq('user_id', user.id);

      let memberships: CommunityMembership[] = [];
      if (!membershipsError && membershipsData) {
        memberships = membershipsData as unknown as CommunityMembership[];
      }

      // Combine communities with membership info
      const communitiesWithMembership: CommunityWithMembership[] = communitiesData.map(community => {
        const membership = memberships.find((m: CommunityMembership) => m.community_id === community.id);
        return {
          ...community,
          creator_id: community.created_by || '',
          is_active: true, // Default value instead of accessing community.is_active
          user_membership: membership,
          is_member: !!membership,
          user_role: membership?.role as 'admin' | 'moderator' | 'member' | undefined
        };
      });

      setCommunities(communitiesWithMembership);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch communities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCommunity = async (communityData: CreateCommunityData) => {
    // Temporarily disabled - show coming soon message
    toast({
      title: "Coming Soon!",
      description: "Community creation will be available in a future update. Stay tuned!",
    });
    return false;
  };

  const joinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join communities",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('community_memberships' as any)
        .insert({
          user_id: user.id,
          community_id: communityId,
          role: 'member'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already a Member",
            description: "You're already a member of this community",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Joined!",
        description: "You've successfully joined the community",
      });

      fetchCommunities();
      return true;
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community",
        variant: "destructive",
      });
      return false;
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('community_memberships' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('community_id', communityId);

      if (error) throw error;

      toast({
        title: "Left Community",
        description: "You've left the community",
      });

      fetchCommunities();
      return true;
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [user]);

  return {
    communities,
    loading,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    refreshCommunities: fetchCommunities
  };
};

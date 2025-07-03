
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
          is_member: false
        }));
        setCommunities(communitiesWithMembership);
        return;
      }

      // Fetch user memberships directly using raw query
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('community_memberships' as any)
        .select('*')
        .eq('user_id', user.id);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        // Continue without membership data
      }

      // Combine communities with membership info
      const communitiesWithMembership: CommunityWithMembership[] = communitiesData.map(community => {
        const membership = membershipsData?.find((m: any) => m.community_id === community.id);
        return {
          ...community,
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a community",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('communities')
        .insert({
          ...communityData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Community created successfully",
      });

      fetchCommunities();
      return data;
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive",
      });
      return false;
    }
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

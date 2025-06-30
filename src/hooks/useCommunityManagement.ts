
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Community {
  id: string;
  name: string;
  description?: string;
  category?: string;
  member_count: number;
  is_featured: boolean;
  image_url?: string;
  moderation_status: string;
  moderated_by?: string;
  moderated_at?: string;
  moderator_notes?: string;
  rejection_reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface CommunityFlag {
  id: string;
  community_id: string;
  flagged_by?: string;
  flag_type: string;
  reason?: string;
  status: string;
  resolved_by?: string;
  resolved_at?: string;
  moderator_notes?: string;
  created_at: string;
  community?: Community;
}

export const useCommunityManagement = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityFlags, setCommunityFlags] = useState<CommunityFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (err: any) {
      console.error('Error fetching communities:', err);
      setError(err.message);
    }
  };

  const fetchCommunityFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('community_flags')
        .select(`
          *,
          community:communities(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunityFlags(data || []);
    } catch (err: any) {
      console.error('Error fetching community flags:', err);
      setError(err.message);
    }
  };

  const moderateCommunity = async (
    communityId: string, 
    status: 'approved' | 'rejected' | 'suspended',
    notes?: string,
    rejectionReason?: string
  ) => {
    try {
      const { error } = await supabase
        .from('communities')
        .update({
          moderation_status: status,
          moderated_by: (await supabase.auth.getUser()).data.user?.id,
          moderated_at: new Date().toISOString(),
          moderator_notes: notes,
          rejection_reason: rejectionReason
        })
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Community ${status} successfully`,
      });

      await fetchCommunities();
      return { success: true };
    } catch (err: any) {
      console.error('Error moderating community:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const resolveCommunityFlag = async (
    flagId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('community_flags')
        .update({
          status,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString(),
          moderator_notes: notes
        })
        .eq('id', flagId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Community flag ${status} successfully`,
      });

      await fetchCommunityFlags();
      return { success: true };
    } catch (err: any) {
      console.error('Error resolving community flag:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const deleteCommunity = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Community deleted successfully",
      });

      await fetchCommunities();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting community:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchCommunities(), fetchCommunityFlags()]);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCommunities(), fetchCommunityFlags()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    communities,
    communityFlags,
    loading,
    error,
    moderateCommunity,
    resolveCommunityFlag,
    deleteCommunity,
    refetch
  };
};

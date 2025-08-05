import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  industry?: string;
  is_public: boolean;
}

interface AdinProfile {
  id: string;
  influence_score: number;
  region_focus: string[] | null;
  sector_focus: string[] | null;
  verified: boolean;
  display_name?: string;
  tags?: any;
  last_updated: string;
}

interface UserContribution {
  id: string;
  type: string;
  target_title?: string;
  created_at: string;
  metadata?: any;
}

interface ImpactLogEntry {
  id: string;
  type: string;
  target_type?: string;
  points: number;
  pillar?: string;
  created_at: string;
  context?: any;
}

export interface ImpactProfileData {
  profile: UserProfile | null;
  adinProfile: AdinProfile | null;
  contributions: UserContribution[];
  impactLog: ImpactLogEntry[];
  loading: boolean;
  error: string | null;
}

export const useImpactProfile = (username: string) => {
  const [data, setData] = useState<ImpactProfileData>({
    profile: null,
    adinProfile: null,
    contributions: [],
    impactLog: [],
    loading: true,
    error: null
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setData(prev => ({ ...prev, loading: false, error: 'Username is required' }));
        return;
      }

      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch user profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .eq('is_public', true)
          .maybeSingle();

        if (profileError || !profileData) {
          setData(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Profile not found or not public' 
          }));
          return;
        }

        // Fetch ADIN profile
        const { data: adinData, error: adinError } = await supabase
          .from('adin_profiles')
          .select('*')
          .eq('id', profileData.id)
          .maybeSingle();

        // Fetch user contributions
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('contributions')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch impact log
        const { data: impactData, error: impactError } = await supabase
          .from('impact_log')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setData({
          profile: profileData,
          adinProfile: adinError ? null : adinData,
          contributions: contributionsError ? [] : (contributionsData || []),
          impactLog: impactError ? [] : (impactData || []),
          loading: false,
          error: null
        });

      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load profile data' 
        }));
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    };

    fetchProfileData();
  }, [username, toast]);

  return data;
};
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export const profilesService = {
  // Get all public profiles with optional filtering
  // Only returns non-sensitive fields (no email, phone, private contact info)
  async getPublicProfiles(filters?: {
    location?: string;
    skills?: string[];
    profession?: string;
    limit?: number;
  }) {
    const { data, error } = await supabase
      .rpc('rpc_public_profiles', {
        p_location: filters?.location ?? null,
        p_profession: filters?.profession ?? null,
        p_skills: filters?.skills ?? null,
        p_limit: filters?.limit ?? null,
      });

    if (error) throw error;
    return data;
  },

  // Get profile by ID - respects privacy settings
  // Only returns non-sensitive fields for public viewing
  async getProfileById(id: string) {
    const { data, error } = await supabase
      .rpc('rpc_public_profile_by_id', { p_id: id })
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get profile by username using secure function
  async getProfileByUsername(username: string) {
    const { data: profiles, error } = await supabase
      .rpc('get_public_profiles', { p_limit: 50 });
    
    if (error) throw error;
    
    const profile = profiles?.find((p: any) => p.username === username);
    return profile || null;
  },

  // Update user's own profile
  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) {
      throw new Error('No profile updated. Please check your permissions and try again.');
    }
    return data;
  },

  // Get own full profile with all fields (including private ones)
  async getOwnProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get current user's full profile with realtime updates
  async getCurrentUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Get projects and initiatives for a user
  async getUserProjectsAndInitiatives(userId: string) {
    const [projectsResult, initiativesResult] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('creator_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('initiatives')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
    ]);

    return {
      projects: projectsResult.data || [],
      initiatives: initiativesResult.data || [],
    };
  }
};
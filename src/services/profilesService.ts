import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export const profilesService = {
  // Get all public profiles with optional filtering
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

  // Get profile by ID
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
      .single();
    
    if (error) throw error;
    return data;
  }
};
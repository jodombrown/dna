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
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true);

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.profession) {
      query = query.ilike('profession', `%${filters.profession}%`);
    }

    if (filters?.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get profile by ID with safe error handling
  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle() to prevent crashes when profile doesn't exist
    
    if (error) throw error;
    
    // Return null if no profile found instead of throwing error
    return data;
  },

  // Update user's own profile
  async updateProfile(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle(); // Use maybeSingle() for safer updates
    
    if (error) throw error;
    return data;
  }
};
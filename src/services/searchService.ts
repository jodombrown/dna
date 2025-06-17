
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from '@/types/searchTypes';

export const buildProfileQuery = (filters: SearchFilters) => {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true);

  // Apply text search filters
  if (filters.searchTerm) {
    query = query.or(
      `full_name.ilike.%${filters.searchTerm}%,profession.ilike.%${filters.searchTerm}%,company.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`
    );
  }

  // Apply location filter
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  // Apply profession filter
  if (filters.profession) {
    query = query.eq('profession', filters.profession);
  }

  // Apply skills filter
  if (filters.skills.length > 0) {
    query = query.overlaps('skills', filters.skills);
  }

  return query.order('created_at', { ascending: false });
};

export const buildProfessionalQuery = (filters: SearchFilters) => {
  let query = supabase
    .from('professionals')
    .select('*');

  // Apply text search filters
  if (filters.searchTerm) {
    query = query.or(
      `full_name.ilike.%${filters.searchTerm}%,profession.ilike.%${filters.searchTerm}%,company.ilike.%${filters.searchTerm}%,bio.ilike.%${filters.searchTerm}%`
    );
  }

  // Apply location filter
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  // Apply profession filter
  if (filters.profession) {
    query = query.eq('profession', filters.profession);
  }

  // Apply country of origin filter
  if (filters.countryOfOrigin) {
    query = query.eq('country_of_origin', filters.countryOfOrigin);
  }

  // Apply boolean filters
  if (filters.isMentor) {
    query = query.eq('is_mentor', true);
  }

  if (filters.isInvestor) {
    query = query.eq('is_investor', true);
  }

  if (filters.lookingForOpportunities) {
    query = query.eq('looking_for_opportunities', true);
  }

  // Apply skills filter
  if (filters.skills.length > 0) {
    query = query.overlaps('expertise', filters.skills);
  }

  return query.order('created_at', { ascending: false });
};

export const filterByExperience = (data: any[], experienceFilter: string) => {
  if (!experienceFilter) return data;

  return data.filter(profile => {
    const years = profile.years_experience || profile.years_in_diaspora;
    if (!years) return false;
    
    switch (experienceFilter) {
      case '0-2': return years >= 0 && years <= 2;
      case '3-5': return years >= 3 && years <= 5;
      case '6-10': return years >= 6 && years <= 10;
      case '11-15': return years >= 11 && years <= 15;
      case '15+': return years >= 15;
      default: return true;
    }
  });
};

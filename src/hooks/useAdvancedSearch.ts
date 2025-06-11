
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilters } from '@/components/search/AdvancedSearch';

interface SearchResult {
  id: string;
  full_name: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  skills?: string[];
  is_mentor?: boolean;
  is_investor?: boolean;
  looking_for_opportunities?: boolean;
  years_experience?: number;
  country_of_origin?: string;
}

export const useAdvancedSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfiles = async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
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

      // Apply country of origin filter
      if (filters.countryOfOrigin) {
        query = query.eq('country_of_origin', filters.countryOfOrigin);
      }

      // Apply skills filter
      if (filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by boolean fields and experience
      let filteredData = data || [];

      if (filters.isMentor) {
        filteredData = filteredData.filter(profile => 
          profile.mentorship_areas && profile.mentorship_areas.length > 0
        );
      }

      if (filters.experience) {
        filteredData = filteredData.filter(profile => {
          if (!profile.years_in_diaspora) return false;
          
          const years = profile.years_in_diaspora;
          switch (filters.experience) {
            case '0-2': return years >= 0 && years <= 2;
            case '3-5': return years >= 3 && years <= 5;
            case '6-10': return years >= 6 && years <= 10;
            case '11-15': return years >= 11 && years <= 15;
            case '15+': return years >= 15;
            default: return true;
          }
        });
      }

      // Map to SearchResult format
      const searchResults: SearchResult[] = filteredData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown',
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        skills: profile.skills,
        is_mentor: profile.mentorship_areas && profile.mentorship_areas.length > 0,
        is_investor: false, // Not in profiles table
        looking_for_opportunities: false, // Not in profiles table
        years_experience: profile.years_in_diaspora,
        country_of_origin: profile.country_of_origin
      }));

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchProfessionals = async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
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

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by experience
      let filteredData = data || [];

      if (filters.experience) {
        filteredData = filteredData.filter(profile => {
          if (!profile.years_experience) return false;
          
          const years = profile.years_experience;
          switch (filters.experience) {
            case '0-2': return years >= 0 && years <= 2;
            case '3-5': return years >= 3 && years <= 5;
            case '6-10': return years >= 6 && years <= 10;
            case '11-15': return years >= 11 && years <= 15;
            case '15+': return years >= 15;
            default: return true;
          }
        });
      }

      // Map to SearchResult format
      const searchResults: SearchResult[] = filteredData.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        skills: profile.expertise,
        is_mentor: profile.is_mentor,
        is_investor: profile.is_investor,
        looking_for_opportunities: profile.looking_for_opportunities,
        years_experience: profile.years_experience,
        country_of_origin: profile.country_of_origin
      }));

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    searchProfiles,
    searchProfessionals,
    clearResults
  };
};

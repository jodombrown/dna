
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Professional {
  id: string;
  full_name: string;
  profession?: string;
  company?: string;
  location?: string;
  country_of_origin?: string;
  expertise?: string[];
  bio?: string;
  years_experience?: number;
  education?: string;
  languages?: string[];
  availability_for?: string[];
  linkedin_url?: string;
  website_url?: string;
  avatar_url?: string;
  is_mentor: boolean;
  is_investor: boolean;
  looking_for_opportunities: boolean;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  category?: string;
  member_count: number;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type?: string;
  date_time?: string;
  location?: string;
  is_virtual: boolean;
  attendee_count: number;
  max_attendees?: number;
  is_featured: boolean;
  image_url?: string;
  registration_url?: string;
  created_at: string;
  updated_at: string;
}

export const useSearch = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProfessionals = async (searchTerm: string = '', filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('professionals').select('*');
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }
      
      if (filters.expertise && filters.expertise.length > 0) {
        query = query.overlaps('expertise', filters.expertise);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      
      if (filters.is_mentor !== undefined) {
        query = query.eq('is_mentor', filters.is_mentor);
      }
      
      if (filters.is_investor !== undefined) {
        query = query.eq('is_investor', filters.is_investor);
      }
      
      if (filters.looking_for_opportunities !== undefined) {
        query = query.eq('looking_for_opportunities', filters.looking_for_opportunities);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfessionals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchCommunities = async (searchTerm: string = '', category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('communities').select('*');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('member_count', { ascending: false });
      
      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async (searchTerm: string = '', filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('events').select('*');
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.is_virtual !== undefined) {
        query = query.eq('is_virtual', filters.is_virtual);
      }
      
      if (filters.upcoming_only) {
        query = query.gte('date_time', new Date().toISOString());
      }
      
      const { data, error } = await query.order('date_time', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [professionalsRes, communitiesRes, eventsRes] = await Promise.all([
        supabase.from('professionals').select('*').order('created_at', { ascending: false }),
        supabase.from('communities').select('*').order('member_count', { ascending: false }),
        supabase.from('events').select('*').gte('date_time', new Date().toISOString()).order('date_time', { ascending: true })
      ]);
      
      if (professionalsRes.error) throw professionalsRes.error;
      if (communitiesRes.error) throw communitiesRes.error;
      if (eventsRes.error) throw eventsRes.error;
      
      setProfessionals(professionalsRes.data || []);
      setCommunities(communitiesRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    professionals,
    communities,
    events,
    loading,
    error,
    searchProfessionals,
    searchCommunities,
    searchEvents,
    getAllData
  };
};

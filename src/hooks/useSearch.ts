
import { useState } from 'react';
import { Professional, Community, Event } from '@/types/search';
import { searchProfessionals } from '@/services/professionalsService';
import { searchCommunities } from '@/services/communitiesService';
import { searchEvents } from '@/services/eventsService';
import { supabase } from '@/integrations/supabase/client';

export const useSearch = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchProfessionals = async (searchTerm: string = '', filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchProfessionals(searchTerm, filters);
      setProfessionals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCommunities = async (searchTerm: string = '', category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchCommunities(searchTerm, category);
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEvents = async (searchTerm: string = '', filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchEvents(searchTerm, filters);
      setEvents(data);
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
      console.log('Loading all data from database...');
      
      const [professionalsRes, communitiesRes, eventsRes] = await Promise.all([
        supabase.from('professionals').select('*').order('created_at', { ascending: false }),
        supabase.from('communities').select('*').order('member_count', { ascending: false }),
        supabase.from('events').select('*').order('date_time', { ascending: true })
      ]);
      
      if (professionalsRes.error) {
        console.error('Professionals error:', professionalsRes.error);
        throw professionalsRes.error;
      }
      if (communitiesRes.error) {
        console.error('Communities error:', communitiesRes.error);
        throw communitiesRes.error;
      }
      if (eventsRes.error) {
        console.error('Events error:', eventsRes.error);
        throw eventsRes.error;
      }
      
      console.log('Raw data from database:', {
        professionals: professionalsRes.data?.length || 0,
        communities: communitiesRes.data?.length || 0,
        events: eventsRes.data?.length || 0,
        eventsList: eventsRes.data
      });
      
      setProfessionals(professionalsRes.data || []);
      setCommunities(communitiesRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error('Error in getAllData:', err);
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
    searchProfessionals: handleSearchProfessionals,
    searchCommunities: handleSearchCommunities,
    searchEvents: handleSearchEvents,
    getAllData
  };
};

// Re-export types for backward compatibility
export type { Professional, Community, Event };

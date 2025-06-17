
import { useState, useEffect, useCallback } from 'react';
import { Professional, Community, Event } from '@/types/search';
import { fetchProfessionals } from '@/services/professionalsService';
import { fetchCommunities } from '@/services/communitiesService';
import { fetchEvents } from '@/services/eventsService';

export const useConnectSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);

    try {
      const [professionalsData, communitiesData, eventsData] = await Promise.all([
        fetchProfessionals(search),
        fetchCommunities(search),
        fetchEvents(search)
      ]);

      setProfessionals(professionalsData);
      setCommunities(communitiesData);
      setEvents(eventsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Connect search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    loadData(searchTerm);
  }, [searchTerm, loadData]);

  const refreshData = useCallback(() => {
    loadData(searchTerm);
  }, [searchTerm, loadData]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    searchTerm,
    setSearchTerm,
    professionals,
    communities,
    events,
    loading,
    error,
    handleSearch,
    refreshData
  };
};

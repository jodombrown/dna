
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Professional, Community, Event } from './useSearch';
import { SearchFilters, ResultCounts } from '@/types/advancedSearchTypes';
import { demoProfessionals, demoCommunities, demoEvents } from '@/data/demoSearchData';
import { filterProfessionals, filterCommunities, filterEvents, hasActiveFilters } from '@/utils/searchFilters';

export const useAdvancedSearch = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    skills: [],
    isMentor: false,
    isInvestor: false,
    lookingForOpportunities: false
  });
  
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize data
  useEffect(() => {
    if (!initialized) {
      setAllProfessionals(demoProfessionals);
      setAllCommunities(demoCommunities);
      setAllEvents(demoEvents);
      setFilteredProfessionals(demoProfessionals);
      setFilteredCommunities(demoCommunities);
      setFilteredEvents(demoEvents);
      setInitialized(true);
    }
  }, [initialized]);

  // Apply filters and search
  useEffect(() => {
    if (!initialized) return;

    setLoading(true);
    
    // Simulate search delay
    const timeoutId = setTimeout(() => {
      const filteredProfs = filterProfessionals(allProfessionals, searchTerm, filters);
      const filteredComms = filterCommunities(allCommunities, searchTerm);
      const filteredEvs = filterEvents(allEvents, searchTerm, filters);

      setFilteredProfessionals(filteredProfs);
      setFilteredCommunities(filteredComms);
      setFilteredEvents(filteredEvs);
      setLoading(false);

      // Show search results toast
      if (searchTerm || hasActiveFilters(filters)) {
        toast({
          title: "Search Results",
          description: `Found ${filteredProfs.length} professionals, ${filteredComms.length} communities, and ${filteredEvs.length} events`,
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters, initialized, allProfessionals, allCommunities, allEvents, toast]);

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      skills: [],
      isMentor: false,
      isInvestor: false,
      lookingForOpportunities: false
    });
  };

  const performSearch = () => {
    // Trigger re-filter (useEffect will handle the actual filtering)
    if (searchTerm || hasActiveFilters(filters)) {
      console.log('Performing search with:', { searchTerm, filters });
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    professionals: filteredProfessionals,
    communities: filteredCommunities,
    events: filteredEvents,
    loading,
    clearSearch,
    performSearch,
    resultCounts: {
      professionals: filteredProfessionals.length,
      communities: filteredCommunities.length,
      events: filteredEvents.length
    } as ResultCounts
  };
};

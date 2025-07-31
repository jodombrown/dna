import { useMemo } from 'react';
import { mockProfessionals } from '@/components/connect/tabs/ProfessionalsMockData';
import { demoCommunities } from '@/data/demoSearchData';
import { useFeaturedEvents } from '@/hooks/useLiveEvents';

interface FilterState {
  location: string;
  skills: string[];
  isMentor: boolean;
  isInvestor: boolean;
  lookingForOpportunities: boolean;
}

export const useConnectFiltering = (searchTerm: string, filters: FilterState) => {
  const { data: liveEvents = [], isLoading } = useFeaturedEvents();

  return useMemo(() => {
    const filterText = searchTerm.toLowerCase();
    
    // Convert mockProfessionals to the expected format for filtering
    const convertedProfessionals = mockProfessionals.map(prof => ({
      id: prof.id,
      full_name: prof.name,
      profession: prof.title,
      company: prof.company,
      location: prof.location,
      country_of_origin: prof.origin,
      bio: prof.bio,
      skills: prof.skills,
      avatar_url: prof.avatar,
      is_mentor: false, // Can be extended later
      is_investor: false, // Can be extended later
      looking_for_opportunities: false, // Can be extended later
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }));
    
    const filteredProfessionals = convertedProfessionals.filter(prof => {
      // Text search
      const matchesText = !searchTerm || 
        prof.full_name.toLowerCase().includes(filterText) ||
        prof.profession.toLowerCase().includes(filterText) ||
        prof.company?.toLowerCase().includes(filterText) ||
        prof.location?.toLowerCase().includes(filterText) ||
        prof.country_of_origin?.toLowerCase().includes(filterText) ||
        prof.bio?.toLowerCase().includes(filterText);
      
      // Location filter  
      const matchesLocation = !filters.location || filters.location === 'all' || 
        prof.location?.toLowerCase() === filters.location.toLowerCase() ||
        prof.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      // Skills filter
      const matchesSkills = filters.skills.length === 0 ||
        filters.skills.some(skill => 
          prof.skills?.some(profSkill => 
            profSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      
      return matchesText && matchesLocation && matchesSkills;
    });

    const filteredCommunities = demoCommunities.filter(comm => {
      // Text search
      const matchesText = !searchTerm || 
        comm.name.toLowerCase().includes(filterText) ||
        comm.description.toLowerCase().includes(filterText) ||
        comm.category.toLowerCase().includes(filterText);
      
      // Category filter (using skills filter for community categories)
      const matchesCategory = filters.skills.length === 0 ||
        filters.skills.some(skill => 
          comm.category.toLowerCase().includes(skill.toLowerCase()) ||
          comm.name.toLowerCase().includes(skill.toLowerCase()) ||
          comm.description.toLowerCase().includes(skill.toLowerCase())
        );
      
      return matchesText && matchesCategory;
    });

    const filteredEvents = liveEvents.filter(event => {
      // Text search
      const matchesText = !searchTerm || 
        event.title.toLowerCase().includes(filterText) ||
        event.description?.toLowerCase().includes(filterText) ||
        event.location?.toLowerCase().includes(filterText) ||
        event.type?.toLowerCase().includes(filterText);
      
      // Location filter
      const matchesLocation = !filters.location || filters.location === 'all' || 
        event.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      // Type/Skills filter (using skills filter for event types and categories)
      const matchesType = filters.skills.length === 0 ||
        filters.skills.some(skill => 
          event.type?.toLowerCase().includes(skill.toLowerCase()) ||
          event.title.toLowerCase().includes(skill.toLowerCase()) ||
          event.description?.toLowerCase().includes(skill.toLowerCase())
        );
      
      return matchesText && matchesLocation && matchesType;
    });

    return {
      professionals: filteredProfessionals,
      communities: filteredCommunities,
      events: filteredEvents,
      isLoading
    };
  }, [searchTerm, filters, liveEvents, isLoading]);
};
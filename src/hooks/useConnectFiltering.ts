import { useMemo } from 'react';
import { demoProfessionals, demoCommunities, demoEvents } from '@/data/demoSearchData';

interface FilterState {
  location: string;
  skills: string[];
  isMentor: boolean;
  isInvestor: boolean;
  lookingForOpportunities: boolean;
}

export const useConnectFiltering = (searchTerm: string, filters: FilterState) => {
  return useMemo(() => {
    const filterText = searchTerm.toLowerCase();
    
    const filteredProfessionals = demoProfessionals.filter(prof => {
      // Text search
      const matchesText = !searchTerm || 
        prof.full_name.toLowerCase().includes(filterText) ||
        prof.profession.toLowerCase().includes(filterText) ||
        prof.company?.toLowerCase().includes(filterText) ||
        prof.location?.toLowerCase().includes(filterText) ||
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
      return !searchTerm || 
        comm.name.toLowerCase().includes(filterText) ||
        comm.description.toLowerCase().includes(filterText) ||
        comm.category.toLowerCase().includes(filterText);
    });

    const filteredEvents = demoEvents.filter(event => {
      return !searchTerm || 
        event.title.toLowerCase().includes(filterText) ||
        event.description?.toLowerCase().includes(filterText) ||
        event.location?.toLowerCase().includes(filterText);
    });

    return {
      professionals: filteredProfessionals,
      communities: filteredCommunities,
      events: filteredEvents
    };
  }, [searchTerm, filters]);
};
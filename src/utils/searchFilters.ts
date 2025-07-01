
import { Professional, Community, Event } from '@/types/search';
import { SearchFilters } from '@/types/advancedSearchTypes';

// Create a utility type for filter functions that only need a subset of properties
interface FilterFunctionParams {
  location?: string;
  skills?: string[];
  is_mentor?: boolean;
  is_investor?: boolean;
  looking_for_opportunities?: boolean;
}

export const filterProfessionals = (
  professionals: Professional[],
  searchTerm: string,
  filters: FilterFunctionParams
): Professional[] => {
  const searchLower = searchTerm.toLowerCase().trim();
  
  return professionals.filter(prof => {
    const matchesSearch = !searchTerm || 
      prof.full_name.toLowerCase().includes(searchLower) ||
      prof.profession?.toLowerCase().includes(searchLower) ||
      prof.company?.toLowerCase().includes(searchLower) ||
      prof.bio?.toLowerCase().includes(searchLower) ||
      prof.location?.toLowerCase().includes(searchLower) ||
      prof.country_of_origin?.toLowerCase().includes(searchLower) ||
      prof.skills?.some(skill => skill.toLowerCase().includes(searchLower));

    const matchesLocation = !filters.location || 
      prof.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
      prof.country_of_origin?.toLowerCase().includes(filters.location.toLowerCase());

    const matchesSkills = !filters.skills || filters.skills.length === 0 ||
      filters.skills.some(skill => prof.skills?.some(profSkill => 
        profSkill.toLowerCase().includes(skill.toLowerCase())
      ));

    const matchesMentor = !filters.is_mentor || prof.is_mentor;
    const matchesInvestor = !filters.is_investor || prof.is_investor;
    const matchesOpportunities = !filters.looking_for_opportunities || prof.looking_for_opportunities;

    return matchesSearch && matchesLocation && matchesSkills && 
           matchesMentor && matchesInvestor && matchesOpportunities;
  });
};

export const filterCommunities = (
  communities: Community[],
  searchTerm: string
): Community[] => {
  const searchLower = searchTerm.toLowerCase().trim();
  
  return communities.filter(comm => {
    return !searchTerm || 
      comm.name.toLowerCase().includes(searchLower) ||
      comm.description.toLowerCase().includes(searchLower) ||
      comm.category?.toLowerCase().includes(searchLower);
  });
};

export const filterEvents = (
  events: Event[],
  searchTerm: string,
  filters: FilterFunctionParams
): Event[] => {
  const searchLower = searchTerm.toLowerCase().trim();
  
  return events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.type?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower);

    const matchesLocation = !filters.location || 
      event.location?.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesLocation;
  });
};

export const hasActiveFilters = (filters: FilterFunctionParams): boolean => {
  return Boolean(filters.location) || 
         (filters.skills && filters.skills.length > 0) || 
         Boolean(filters.is_mentor) || 
         Boolean(filters.is_investor) || 
         Boolean(filters.looking_for_opportunities);
};

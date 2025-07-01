
import { useState, useEffect, useMemo } from 'react';
import { enhancedDemoProfessionals, enhancedDemoCommunities, enhancedDemoEvents } from '@/data/enhancedDemoData';
import { Professional, Community, Event } from '@/types/search';

interface EnhancedSearchFilters {
  location: string;
  skills: string[];
  interests: string[];
  profession: string;
  company: string;
  is_mentor: boolean;
  is_investor: boolean;
  looking_for_opportunities: boolean;
}

export const useEnhancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EnhancedSearchFilters>({
    location: '',
    skills: [],
    interests: [],
    profession: '',
    company: '',
    is_mentor: false,
    is_investor: false,
    looking_for_opportunities: false
  });
  const [loading, setLoading] = useState(false);

  // Enhanced filtering logic
  const filteredProfessionals = useMemo(() => {
    return enhancedDemoProfessionals.filter(professional => {
      const matchesSearch = !searchTerm || 
        professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professional.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = !filters.location || 
        professional.location?.toLowerCase().includes(filters.location.toLowerCase());

      const matchesProfession = !filters.profession ||
        professional.profession?.toLowerCase().includes(filters.profession.toLowerCase());

      const matchesCompany = !filters.company ||
        professional.company?.toLowerCase().includes(filters.company.toLowerCase());

      const matchesSkills = filters.skills.length === 0 || 
        filters.skills.some(skill => 
          Array.isArray(professional.skills) 
            ? professional.skills.some(pSkill => pSkill.toLowerCase().includes(skill.toLowerCase()))
            : false
        );

      const matchesMentor = !filters.is_mentor || professional.is_mentor;
      const matchesInvestor = !filters.is_investor || professional.is_investor;
      const matchesOpportunities = !filters.looking_for_opportunities || professional.looking_for_opportunities;

      return matchesSearch && matchesLocation && matchesProfession && 
             matchesCompany && matchesSkills && matchesMentor && 
             matchesInvestor && matchesOpportunities;
    });
  }, [searchTerm, filters]);

  const filteredCommunities = useMemo(() => {
    return enhancedDemoCommunities.filter(community => {
      const matchesSearch = !searchTerm ||
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.category?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [searchTerm]);

  const filteredEvents = useMemo(() => {
    return enhancedDemoEvents.filter(event => {
      const matchesSearch = !searchTerm ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [searchTerm]);

  const performSearch = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      skills: [],
      interests: [],
      profession: '',
      company: '',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: false
    });
  };

  const resultCounts = {
    professionals: filteredProfessionals.length,
    communities: filteredCommunities.length,
    events: filteredEvents.length
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
    performSearch,
    clearSearch,
    resultCounts
  };
};

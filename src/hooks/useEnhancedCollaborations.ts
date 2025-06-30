
import { useState, useEffect, useMemo } from 'react';
import { CollaborationProject, CollaborationFilters, CollaborationStats } from '@/types/collaborationTypes';
import { enhancedCollaborationProjects, collaborationStats } from '@/data/enhancedCollaborationData';
import { useToast } from '@/hooks/use-toast';

const initialFilters: CollaborationFilters = {
  impact_area: [],
  region: [],
  contribution_types: [],
  skills: [],
  time_commitment: [],
  funding_range: null,
  urgency: [],
  search_query: ''
};

export const useEnhancedCollaborations = () => {
  const { toast } = useToast();
  const [allProjects, setAllProjects] = useState<CollaborationProject[]>([]);
  const [filters, setFilters] = useState<CollaborationFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'urgency' | 'progress' | 'recent'>('relevance');

  // Initialize data
  useEffect(() => {
    setAllProjects(enhancedCollaborationProjects);
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = allProjects.filter(project => {
      // Search query
      if (filters.search_query) {
        const query = filters.search_query.toLowerCase();
        const matchesQuery = 
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.skills_needed.some(skill => skill.toLowerCase().includes(query)) ||
          project.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesQuery) return false;
      }

      // Impact area filter
      if (filters.impact_area.length > 0 && !filters.impact_area.includes(project.impact_area as any)) {
        return false;
      }

      // Region filter  
      if (filters.region.length > 0 && !filters.region.includes(project.region as any)) {
        return false;
      }

      // Contribution types filter
      if (filters.contribution_types.length > 0) {
        const hasMatchingContribution = filters.contribution_types.some(type => 
          project.contribution_types.includes(type)
        );
        if (!hasMatchingContribution) return false;
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some(skill => 
          project.skills_needed.some(projectSkill => 
            projectSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasMatchingSkill) return false;
      }

      // Time commitment filter
      if (filters.time_commitment.length > 0 && !filters.time_commitment.includes(project.time_commitment)) {
        return false;
      }

      // Urgency filter
      if (filters.urgency.length > 0 && !filters.urgency.includes(project.urgency)) {
        return false;
      }

      // Funding range filter
      if (filters.funding_range && project.funding_goal) {
        const [min, max] = filters.funding_range;
        if (project.funding_goal < min || project.funding_goal > max) {
          return false;
        }
      }

      return true;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        case 'progress':
          return b.progress - a.progress;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: // relevance
          return b.collaborators - a.collaborators;
      }
    });

    return filtered;
  }, [allProjects, filters, sortBy]);

  const updateFilters = (newFilters: Partial<CollaborationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    toast({
      title: "Filters cleared",
      description: "All filters have been reset",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search_query ||
      filters.impact_area.length > 0 ||
      filters.region.length > 0 ||
      filters.contribution_types.length > 0 ||
      filters.skills.length > 0 ||
      filters.time_commitment.length > 0 ||
      filters.urgency.length > 0 ||
      filters.funding_range
    );
  }, [filters]);

  return {
    projects: filteredProjects,
    allProjects,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    sortBy,
    setSortBy,
    loading,
    stats: collaborationStats
  };
};

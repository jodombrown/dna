import { useState, useEffect, useMemo } from 'react';
import { CollaborationProject, CollaborationFilters, CollaborationStats } from '@/types/collaborationTypes';
import { supabase } from '@/integrations/supabase/client';
import { enhancedCollaborationProjects, calculateStats } from '@/data/enhancedCollaborationData';
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

// Hook for marketing pages - uses rich mock data to showcase vision
export const useEnhancedCollaborations = () => {
  const [projects] = useState<CollaborationProject[]>(enhancedCollaborationProjects);
  const [loading] = useState(false);
  const [filters, setFilters] = useState<CollaborationFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<'relevance' | 'urgency' | 'progress' | 'recent'>('relevance');
  const { toast } = useToast();

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
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
  }, [projects, filters, sortBy]);

  const stats: CollaborationStats = useMemo(() => {
    return calculateStats(filteredAndSortedProjects);
  }, [filteredAndSortedProjects]);

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
    projects: filteredAndSortedProjects,
    allProjects: projects,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    sortBy,
    setSortBy,
    loading,
    stats
  };
};

// Hook for dashboard pages - uses live Supabase data
export const useLiveDashboardCollaborations = () => {
  const [projects, setProjects] = useState<CollaborationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CollaborationFilters>(initialFilters);
  const [sortBy, setSortBy] = useState<'relevance' | 'urgency' | 'progress' | 'recent'>('relevance');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contribution_cards')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: "Error",
            description: "Failed to load collaboration projects",
            variant: "destructive",
          });
          return;
        }

        // Transform contribution_cards to CollaborationProject format
        const transformedProjects: CollaborationProject[] = (data || []).map(card => ({
          id: card.id,
          title: card.title,
          description: card.description || '',
          impact_area: card.impact_area || 'general',
          region: 'africa',
          countries: [card.location || 'Multiple'],
          contribution_types: card.contribution_type ? [card.contribution_type as any] : ['funding'],
          skills_needed: [],
          team_size: 1,
          collaborators: 0,
          funding_goal: card.amount_needed || 0,
          current_funding: card.amount_raised || 0,
          progress: card.amount_needed ? Math.round(((card.amount_raised || 0) / card.amount_needed) * 100) : 0,
          status: 'active',
          urgency: 'medium',
          time_commitment: 'flexible',
          creator: {
            name: 'Community Member',
            avatar: '',
            title: 'Contributor'
          },
          collaborator_avatars: [],
          tags: [card.impact_area || 'General'],
          timeline: 'Ongoing',
          next_milestone: 'In progress',
          recent_update: 'Project is active and seeking contributions',
          image_url: card.image_url,
          created_at: card.created_at
        }));

        setProjects(transformedProjects);
      } catch {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  // Filter and sort logic (same as above)
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      if (filters.search_query) {
        const query = filters.search_query.toLowerCase();
        const matchesQuery = 
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.skills_needed.some(skill => skill.toLowerCase().includes(query)) ||
          project.tags.some(tag => tag.toLowerCase().includes(query));
        
        if (!matchesQuery) return false;
      }

      if (filters.impact_area.length > 0 && !filters.impact_area.includes(project.impact_area as any)) {
        return false;
      }

      if (filters.region.length > 0 && !filters.region.includes(project.region as any)) {
        return false;
      }

      if (filters.contribution_types.length > 0) {
        const hasMatchingContribution = filters.contribution_types.some(type => 
          project.contribution_types.includes(type)
        );
        if (!hasMatchingContribution) return false;
      }

      if (filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some(skill => 
          project.skills_needed.some(projectSkill => 
            projectSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        if (!hasMatchingSkill) return false;
      }

      if (filters.time_commitment.length > 0 && !filters.time_commitment.includes(project.time_commitment)) {
        return false;
      }

      if (filters.urgency.length > 0 && !filters.urgency.includes(project.urgency)) {
        return false;
      }

      if (filters.funding_range && project.funding_goal) {
        const [min, max] = filters.funding_range;
        if (project.funding_goal < min || project.funding_goal > max) {
          return false;
        }
      }

      return true;
    });

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
  }, [projects, filters, sortBy]);

  const stats: CollaborationStats = useMemo(() => {
    const totalCollaborators = filteredAndSortedProjects.reduce((sum, project) => sum + project.collaborators, 0);
    const uniqueCountries = new Set(filteredAndSortedProjects.flatMap(project => project.countries));
    const totalFunding = filteredAndSortedProjects.reduce((sum, project) => sum + (project.current_funding || 0), 0);
    
    return {
      total_projects: filteredAndSortedProjects.length,
      active_collaborators: totalCollaborators,
      countries_involved: uniqueCountries.size,
      total_funding: `$${(totalFunding / 1000000).toFixed(1)}M`,
      impact_stories: Math.floor(filteredAndSortedProjects.length * 0.6)
    };
  }, [filteredAndSortedProjects]);

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
    projects: filteredAndSortedProjects,
    allProjects: projects,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    sortBy,
    setSortBy,
    loading,
    stats
  };
};
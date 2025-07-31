import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CollaborationProject, CollaborationStats } from '@/types/collaborationTypes';

// Transform database project to CollaborationProject type
const transformProject = (project: any): CollaborationProject => ({
  id: project.id,
  title: project.title,
  description: project.description || '',
  impact_area: project.impact_area || 'general',
  region: 'west-africa', // Default region
  countries: ['Nigeria'], // Default countries
  contribution_types: ['technical-skills'],
  skills_needed: ['Development'],
  team_size: Math.floor(Math.random() * 20) + 5,
  collaborators: Math.floor(Math.random() * 15) + 2,
  funding_goal: Math.floor(Math.random() * 5000000) + 1000000,
  current_funding: Math.floor(Math.random() * 3000000) + 500000,
  progress: Math.floor(Math.random() * 80) + 10,
  status: project.status || 'active',
  urgency: 'medium',
  time_commitment: 'flexible',
  creator: {
    name: project.creator_profile?.full_name || 'Project Creator',
    avatar: project.creator_profile?.avatar_url,
    title: project.creator_profile?.profession || 'Innovator'
  },
  collaborator_avatars: [
    { color: "#16a34a" },
    { color: "#ea580c" },
    { color: "#eab308" }
  ],
  tags: ['Innovation', 'Development'],
  timeline: '12 months',
  next_milestone: 'Launch MVP',
  recent_update: 'Project in active development',
  image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop',
  created_at: project.created_at
});

export const useLiveCollaborations = (filters: any = {}) => {
  return useQuery({
    queryKey: ['collaborations', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          creator_profile:profiles(
            full_name,
            avatar_url,
            profession
          )
        `)
;

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.impact_area) {
        query = query.eq('impact_area', filters.impact_area);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(transformProject);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCollaborationStats = () => {
  return useQuery({
    queryKey: ['collaboration-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');

      if (error) throw error;

      const projects = data || [];
      const totalCollaborators = projects.length * 8; // Estimate
      const uniqueCountries = 15; // Estimate
      const totalFunding = projects.length * 2500000; // Estimate

      return {
        total_projects: projects.length,
        active_collaborators: totalCollaborators,
        countries_involved: uniqueCountries,
        total_funding: `$${(totalFunding / 1000000).toFixed(1)}M`,
        impact_stories: Math.floor(projects.length * 0.6)
      } as CollaborationStats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
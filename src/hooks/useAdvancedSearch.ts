
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Professional, Community, Event } from './useSearch';
import { SearchFilters, ResultCounts } from '@/types/advancedSearchTypes';
import { supabase } from '@/integrations/supabase/client';

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
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  const [loading, setLoading] = useState(false);

  const searchProfessionals = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true);

      // Apply text search
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      // Apply location filter
      if (filters.location) {
        query = query.or(`location.ilike.%${filters.location}%,current_country.ilike.%${filters.location}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      // Transform to Professional format
      const transformedProfessionals: Professional[] = (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'DNA Professional',
        avatar_url: profile.avatar_url || profile.profile_picture_url,
        bio: profile.bio,
        location: profile.location || profile.current_country,
        profession: profile.profession || profile.professional_role,
        company: profile.company,
        is_mentor: false,
        is_investor: false, 
        looking_for_opportunities: false,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        skills: profile.skills || [],
        country_of_origin: profile.current_country
      }));

      // Apply skill filters
      let filteredProfessionals = transformedProfessionals;
      if (filters.skills.length > 0) {
        filteredProfessionals = transformedProfessionals.filter(prof =>
          prof.skills.some(skill => 
            filters.skills.some(filterSkill => 
              skill.toLowerCase().includes(filterSkill.toLowerCase())
            )
          )
        );
      }

      setProfessionals(filteredProfessionals);
    } catch {
      setProfessionals([]);
    }
  };

  const searchCommunities = async () => {
    try {
      let query = supabase
        .from('communities')
        .select('*')
        .eq('moderation_status', 'approved')
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      const transformedCommunities: Community[] = (data || []).map(community => ({
        id: community.id,
        name: community.name,
        description: community.description || 'No description available',
        memberCount: community.member_count || 0,
        member_count: community.member_count || 0,
        category: community.category || 'General',
        tags: community.tags || [],
        image: community.image_url,
        isJoined: false,
        is_featured: community.is_featured || false,
        created_at: community.created_at,
        updated_at: community.updated_at
      }));

      setCommunities(transformedCommunities);
    } catch {
      setCommunities([]);
    }
  };

  const searchEvents = async () => {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_cancelled', false)
        .gte('start_time', new Date().toISOString());

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,event_type.ilike.%${searchTerm}%`);
      }

      if (filters.location) {
        query = query.or(`location_name.ilike.%${filters.location}%,location_city.ilike.%${filters.location}%,location_country.ilike.%${filters.location}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      const transformedEvents: Event[] = (data || []).map(event => {
        const location = event.location_name || 
                        (event.location_city && event.location_country 
                          ? `${event.location_city}, ${event.location_country}`
                          : event.location_city || event.location_country || 'Location TBD');
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || 'No description available',
          date: event.start_time,
          date_time: event.start_time,
          location: location,
          attendeeCount: 0,
          attendee_count: 0,
          maxAttendees: event.max_attendees,
          max_attendees: event.max_attendees,
          type: event.event_type || 'event',
          image: event.cover_image_url,
          isRegistered: false,
          is_virtual: event.format === 'virtual' || event.format === 'hybrid',
          is_featured: false,
          created_at: event.created_at,
          updated_at: event.updated_at
        } as Event;
      });

      setEvents(transformedEvents);
    } catch {
      setEvents([]);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      await Promise.all([
        searchProfessionals(),
        searchCommunities(),
        searchEvents()
      ]);
      
      toast({
        title: "Search Results",
        description: `Found ${professionals.length} professionals, ${communities.length} communities, and ${events.length} events`,
      });
    } catch {
      toast({
        title: "Search Error",
        description: "Failed to search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      skills: [],
      isMentor: false,
      isInvestor: false,
      lookingForOpportunities: false
    });
    setProfessionals([]);
    setCommunities([]);
    setEvents([]);
  };

  // Perform search when searchTerm or filters change
  useEffect(() => {
    if (searchTerm || filters.location || filters.skills.length > 0) {
      const timeoutId = setTimeout(performSearch, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    professionals,
    communities,
    events,
    loading,
    clearSearch,
    performSearch,
    resultCounts: {
      professionals: professionals.length,
      communities: communities.length,
      events: events.length
    } as ResultCounts
  };
};

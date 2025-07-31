
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/eventTypes';

export const useEventData = (canManageEvents: boolean) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!canManageEvents) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching events...');
      
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Events fetch error:', eventsError);
        throw eventsError;
      }

      console.log('Events fetched:', eventsData?.length || 0);

      const creatorIds = eventsData?.map(event => event.created_by).filter(Boolean) || [];
      
      let profilesData = [];
      if (creatorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', creatorIds);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      const transformedData: Event[] = (eventsData || []).map(event => {
        const creatorProfile = profilesData.find(profile => profile.id === event.created_by);
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          date_time: event.date_time || '',
          location: event.location || '',
          type: event.type || '',
          attendee_count: event.attendee_count || 0,
          max_attendees: event.max_attendees,
          is_featured: event.is_featured || false,
          is_virtual: event.is_virtual || false,
          created_at: event.created_at,
          updated_at: event.updated_at || event.created_at,
          created_by: event.created_by || '',
          banner_url: event.banner_url || null,
          image_url: event.image_url || null,
          registration_url: event.registration_url || null,
          creator_profile: creatorProfile ? {
            id: creatorProfile.id,
            full_name: creatorProfile.full_name || 'Unknown',
            email: creatorProfile.email || '',
            avatar_url: creatorProfile.avatar_url || null
          } : null
        };
      });
      
      console.log('Transformed events:', transformedData.length);
      setEvents(transformedData);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: `Failed to load events: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [canManageEvents, toast]);

  return { events, loading, fetchEvents };
};

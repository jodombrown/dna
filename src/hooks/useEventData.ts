
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

      const creatorIds = eventsData?.map(event => event.organizer_id).filter(Boolean) || [];
      
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
        const creatorProfile = profilesData.find(profile => profile.id === event.organizer_id);
        const location = event.location_name || 
                        (event.location_city && event.location_country 
                          ? `${event.location_city}, ${event.location_country}`
                          : event.location_city || event.location_country || '');
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          organizer_id: event.organizer_id,
          event_type: event.event_type as any,
          format: event.format as any,
          start_time: event.start_time,
          end_time: event.end_time,
          location_name: event.location_name,
          location_city: event.location_city,
          location_country: event.location_country,
          cover_image_url: event.cover_image_url,
          is_public: event.is_public,
          requires_approval: event.requires_approval,
          allow_guests: event.allow_guests,
          is_cancelled: event.is_cancelled,
          max_attendees: event.max_attendees,
          created_at: event.created_at,
          updated_at: event.updated_at,
          // Legacy compatibility
          date_time: event.start_time,
          location: location,
          type: event.event_type,
          is_virtual: event.format === 'virtual' || event.format === 'hybrid',
          attendee_count: 0,
          created_by: event.organizer_id || '',
          creator_profile: creatorProfile ? {
            full_name: creatorProfile.full_name || 'Unknown',
            email: creatorProfile.email || ''
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

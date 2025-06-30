
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  type: string;
  attendee_count: number;
  max_attendees: number | null;
  is_featured: boolean;
  is_virtual: boolean;
  created_at: string;
  created_by: string;
  creator_profile?: {
    full_name: string;
    email: string;
  } | null;
}

export const useEventManagement = () => {
  const { adminUser, loading: authLoading, hasAnyRole } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const canManageEvents = hasAnyRole(['super_admin', 'event_manager']);

  const fetchEvents = useCallback(async () => {
    // Don't fetch if auth is still loading or user can't manage events
    if (authLoading || !canManageEvents) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching events...');
      
      // First fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Events fetch error:', eventsError);
        throw eventsError;
      }

      console.log('Events fetched:', eventsData?.length || 0);

      // Then fetch profiles for creators
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

      // Combine the data
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
          created_by: event.created_by || '',
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
  }, [authLoading, canManageEvents, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventAction = async (eventId: string, action: 'feature' | 'unfeature' | 'delete' | 'edit') => {
    console.log('Event action:', action, 'for event:', eventId);
    
    try {
      if (action === 'delete') {
        console.log('Attempting to delete event:', eventId);
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);
        
        if (error) {
          console.error('Delete error:', error);
          throw error;
        }
        
        toast({
          title: "Event Deleted",
          description: "The event has been permanently deleted.",
        });
      } else if (action === 'feature' || action === 'unfeature') {
        console.log('Attempting to', action, 'event:', eventId);
        const { error } = await supabase
          .from('events')
          .update({ is_featured: action === 'feature' })
          .eq('id', eventId);
        
        if (error) {
          console.error('Feature toggle error:', error);
          throw error;
        }
        
        toast({
          title: action === 'feature' ? "Event Featured" : "Event Unfeatured",
          description: `The event has been ${action === 'feature' ? 'featured' : 'unfeatured'}.`,
        });
      } else if (action === 'edit') {
        // For now, just show a message that edit functionality is coming
        toast({
          title: "Edit Event",
          description: "Edit functionality is coming soon!",
        });
        return; // Don't refresh events for edit action yet
      }
      
      // Refresh events after successful action
      await fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} event: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    
    const now = new Date();
    const eventDate = new Date(event.date_time);
    
    let matchesTab = true;
    if (activeTab === 'upcoming') {
      matchesTab = eventDate > now;
    } else if (activeTab === 'past') {
      matchesTab = eventDate < now;
    } else if (activeTab === 'featured') {
      matchesTab = event.is_featured;
    }
    
    return matchesSearch && matchesType && matchesTab;
  });

  return {
    events,
    filteredEvents,
    loading,
    authLoading,
    canManageEvents,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    activeTab,
    setActiveTab,
    fetchEvents,
    handleEventAction,
    navigate
  };
};


import { useState, useEffect } from 'react';
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator_profile:profiles!created_by(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle the profile relationship properly
      const transformedData: Event[] = (data || []).map(event => ({
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
        creator_profile: event.creator_profile ? {
          full_name: event.creator_profile.full_name || 'Unknown',
          email: event.creator_profile.email || ''
        } : null
      }));
      
      setEvents(transformedData);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (eventId: string, action: 'feature' | 'unfeature' | 'delete') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);
        
        if (error) throw error;
        
        toast({
          title: "Event Deleted",
          description: "The event has been permanently deleted.",
        });
      } else {
        const { error } = await supabase
          .from('events')
          .update({ is_featured: action === 'feature' })
          .eq('id', eventId);
        
        if (error) throw error;
        
        toast({
          title: action === 'feature' ? "Event Featured" : "Event Unfeatured",
          description: `The event has been ${action === 'feature' ? 'featured' : 'unfeatured'}.`,
        });
      }
      
      await fetchEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event.",
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

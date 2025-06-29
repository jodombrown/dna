
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EventCreationDialog from '@/components/admin/EventCreationDialog';
import AdminEventStats from '@/components/admin/AdminEventStats';
import AdminEventFilters from '@/components/admin/AdminEventFilters';
import AdminEventList from '@/components/admin/AdminEventList';
import { Plus, ArrowLeft } from 'lucide-react';

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

const AdminEventManagement = () => {
  const { adminUser, loading: authLoading, hasAnyRole } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [createEventOpen, setCreateEventOpen] = useState(false);

  const canManageEvents = hasAnyRole(['super_admin', 'event_manager']);

  useEffect(() => {
    if (!authLoading && !canManageEvents) {
      navigate('/admin-dashboard');
      return;
    }
    if (canManageEvents) {
      fetchEvents();
    }
  }, [authLoading, canManageEvents, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator_profile:profiles!events_created_by_fkey(full_name, email)
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
        creator_profile: event.creator_profile && Array.isArray(event.creator_profile) && event.creator_profile.length > 0
          ? event.creator_profile[0]
          : null
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading event management...</div>
      </div>
    );
  }

  if (!canManageEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permission to manage events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin-dashboard')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Event Management</h1>
                <p className="text-sm text-gray-500">Manage community events and activities</p>
              </div>
            </div>
            <Button 
              className="bg-dna-emerald hover:bg-dna-emerald/90"
              onClick={() => setCreateEventOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminEventStats events={events} />
        <AdminEventFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <AdminEventList
              events={filteredEvents}
              searchTerm={searchTerm}
              typeFilter={typeFilter}
              onEventAction={handleEventAction}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EventCreationDialog
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        onEventCreated={fetchEvents}
      />
    </div>
  );
};

export default AdminEventManagement;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EventCreationDialog from '@/components/admin/EventCreationDialog';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const [statusFilter, setStatusFilter] = useState('all');
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
      setEvents(data || []);
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

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date_time);
    
    if (eventDate > now) return 'upcoming';
    return 'past';
  };

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    const colors = {
      upcoming: 'bg-green-100 text-green-800',
      past: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
              <Clock className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => new Date(e.date_time) > new Date()).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Featured Events</CardTitle>
              <Eye className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.filter(e => e.is_featured).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
              <Users className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.attendee_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          {getStatusBadge(event)}
                          {event.is_featured && (
                            <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                          )}
                          {event.is_virtual && (
                            <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date_time).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location || 'Virtual'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {event.attendee_count}
                              {event.max_attendees && ` / ${event.max_attendees}`} attendees
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-sm text-gray-500">
                          Created by {event.creator_profile?.full_name || 'Unknown'} • 
                          {formatDistanceToNow(new Date(event.created_at))} ago
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventAction(event.id, event.is_featured ? 'unfeature' : 'feature')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {event.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventAction(event.id, 'delete')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredEvents.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                    <p className="text-gray-500">
                      {searchTerm || typeFilter !== 'all' 
                        ? 'Try adjusting your search or filters.'
                        : 'No events have been created yet.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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

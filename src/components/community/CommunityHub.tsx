import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Star,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  is_virtual: boolean;
  image_url?: string;
  max_attendees?: number;
  registration_required: boolean;
  registration_url?: string;
  created_by: string;
  community_id: string;
  community?: {
    name: string;
    image_url?: string;
  };
  attendee_count?: number;
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  organization?: string;
  location?: string;
  is_remote?: boolean;
  application_deadline?: string;
  external_link?: string;
  requirements?: string[];
  created_at: string;
  created_by: string;
  // Additional fields that might come from database
  image_url?: string;
  link?: string;
  space_id?: string;
  status?: string;
  tags?: string[];
  updated_at?: string;
  visibility?: string;
}

const CommunityHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'opportunities') {
      fetchOpportunities();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          community:communities(name, image_url)
        `)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error loading events",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: "Error loading opportunities",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId: string, eventTitle: string) => {
    try {
      const { error } = await supabase
        .from('community_event_attendees')
        .insert({
          event_id: eventId,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Successfully registered!",
        description: `You're now registered for "${eventTitle}"`,
      });

      // Refresh events to update attendee count
      fetchEvents();
    } catch (error: any) {
      console.error('Error registering for event:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.community?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOpportunities = opportunities.filter(opportunity =>
    opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opportunity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opportunity.organization && opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const EventCard = ({ event }: { event: CommunityEvent }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-dna-forest mb-2">{event.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
          </div>
          {event.image_url && (
            <img src={event.image_url} alt={event.title} className="w-20 h-20 rounded-lg object-cover ml-4" />
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.event_date).toLocaleDateString()}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{new Date(event.event_date).toLocaleTimeString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.is_virtual ? 'Virtual Event' : event.location || 'Location TBA'}</span>
          </div>

          {event.community && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>{event.community.name}</span>
            </div>
          )}

          {event.max_attendees && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{event.attendee_count || 0} / {event.max_attendees} attendees</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="outline">
              {event.is_virtual ? 'Virtual' : 'In-Person'}
            </Badge>
            {event.registration_required && (
              <Badge variant="secondary">Registration Required</Badge>
            )}
          </div>

          <div className="flex gap-2">
            {event.registration_url ? (
              <Button 
                size="sm" 
                onClick={() => window.open(event.registration_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Register
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => handleRegisterEvent(event.id, event.title)}
                className="bg-dna-copper hover:bg-dna-copper/90"
              >
                Register
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-dna-forest">{opportunity.title}</h3>
            <Badge variant="outline">{opportunity.type}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{opportunity.description}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>{opportunity.organization || 'Organization TBA'}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{opportunity.is_remote ? 'Remote' : opportunity.location || 'Location varies'}</span>
          </div>

          {opportunity.application_deadline && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Deadline: {new Date(opportunity.application_deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
            <div className="flex flex-wrap gap-1">
              {opportunity.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {req}
                </Badge>
              ))}
              {opportunity.requirements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.requirements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Badge variant={opportunity.is_remote ? 'default' : 'outline'}>
            {opportunity.is_remote ? 'Remote' : 'On-site'}
          </Badge>

          {opportunity.external_link ? (
            <Button 
              size="sm" 
              onClick={() => window.open(opportunity.external_link, '_blank')}
              className="bg-dna-emerald hover:bg-dna-emerald/90"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Learn More
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dna-forest">Community Hub</h1>
          <p className="text-gray-600">Discover events, opportunities, and community activities</p>
        </div>
        <Button className="bg-dna-copper hover:bg-dna-copper/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events, opportunities, or organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events ({filteredEvents.length})
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Opportunities ({filteredOpportunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back later for upcoming events'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
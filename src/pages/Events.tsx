
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Users, Video, Globe, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import EnhancedEventCreationDialog from '@/components/events/EnhancedEventCreationDialog';

const Events = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'conference', label: 'Conferences' },
    { id: 'webinar', label: 'Webinars' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'networking', label: 'Networking' },
    { id: 'cultural', label: 'Cultural' }
  ];

  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(event => event.type === selectedFilter);

  const handleRegister = (eventId: string) => {
    console.log('Registering for event:', eventId);
    setIsRegisterDialogOpen(true);
  };

  const confirmRegistration = () => {
    toast.success('Event registration request sent! You will receive a confirmation email once registration opens.');
    setIsRegisterDialogOpen(false);
  };

  const handleEventCreated = () => {
    fetchEvents();
  };

  const getFormatIcon = (isVirtual: boolean) => {
    return isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;
  };

  const getFormatBadge = (isVirtual: boolean) => {
    return isVirtual 
      ? <Badge className="bg-dna-emerald text-white">Virtual</Badge>
      : <Badge className="bg-dna-copper text-white">In-Person</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Upcoming <span className="text-dna-copper">Events</span>
            </h1>
            {user && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect, learn, and collaborate at events designed to strengthen the African diaspora network
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              onClick={() => setSelectedFilter(filter.id)}
              className={selectedFilter === filter.id ? "bg-dna-copper hover:bg-dna-gold" : ""}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading events...</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop'}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-dna-emerald text-white">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90">
                      Free
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                  <p className="text-gray-600">{event.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {event.date_time && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date_time).toLocaleDateString()}
                      </div>
                    )}
                    {event.date_time && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(event.date_time).toLocaleTimeString()}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        {getFormatIcon(event.is_virtual)}
                        <span className="ml-2">{event.location}</span>
                        <span className="ml-2">{getFormatBadge(event.is_virtual)}</span>
                      </div>
                    )}
                    {event.max_attendees && (
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Up to {event.max_attendees} attendees
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      className="flex-1 bg-dna-copper hover:bg-dna-gold"
                      onClick={() => handleRegister(event.id)}
                    >
                      Register Now
                    </Button>
                    <Button variant="outline">
                      Add to Calendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredEvents.length === 0 && !loading && (
              <div className="col-span-2 text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later for new events.</p>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-dna-emerald to-dna-forest text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Host Your Own Event</h3>
              <p className="text-lg mb-6">
                Want to organize an event for the DNA community? We provide platform support and promotion.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-dna-forest hover:bg-gray-100"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create an Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Register Event Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dna-copper" />
              Event Registration Preview
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Thank you for your interest in our events! Our event registration system will offer:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Seamless registration for diaspora events worldwide</li>
                <li>Personalized event recommendations based on your interests</li>
                <li>Networking opportunities with attendees before and after events</li>
                <li>Access to exclusive member-only sessions and workshops</li>
                <li>Integration with your professional profile and connections</li>
                <li>Event recordings and follow-up resources for registered attendees</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                Since we're still building the platform, we'll add you to our early access list and notify you when registration opens for this event.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={confirmRegistration} className="flex-1 bg-dna-copper hover:bg-dna-gold text-white">
              Add Me to Early Access
            </Button>
            <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Creation Dialog */}
      <EnhancedEventCreationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Events;

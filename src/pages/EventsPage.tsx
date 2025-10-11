import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, MapPin, Users } from 'lucide-react';
import { CreateEventModal } from '@/components/convene/CreateEventModal';
import EventRegistrationSidebar from '@/components/connect/EventRegistrationSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Event } from '@/types/search';

const EventsPage = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch upcoming events from Supabase
  const { data: events, isLoading } = useQuery({
    queryKey: ['all-upcoming-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })
        .limit(20);
      
      return data || [];
    },
  });

  const handleEventClick = (event: any) => {
    setSelectedEvent(event as Event);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-8 w-8 text-copper-500" />
                Discover Events
              </h1>
              <p className="text-muted-foreground mt-1">
                Explore upcoming events and connect with your community
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              size="lg"
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Host Event
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Popular Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Upcoming Events ({events?.length || 0})
              </h3>
              <p className="text-sm text-muted-foreground">Discover and join events in your network</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events && events.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {events.map((event) => (
                  <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card 
                      className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="relative">
                        {event.banner_url ? (
                          <img
                            src={event.banner_url}
                            alt={event.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-dna-emerald to-dna-forest flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-white opacity-50" />
                          </div>
                        )}
                        {event.image_url && (
                          <div className="absolute -bottom-6 left-4">
                            <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden bg-white">
                              <img
                                src={event.image_url}
                                alt={`${event.title} logo`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="pt-8 pb-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold line-clamp-1">{event.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{event.type}</Badge>
                            {event.is_virtual && (
                              <Badge className="bg-dna-emerald text-white text-xs">Virtual</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(event.date_time).toLocaleDateString()}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendee_count || 0} attending</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-4">Be the first to host an event</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-dna-emerald hover:bg-dna-forest text-white">
                <Plus className="h-4 w-4 mr-2" />
                Host an Event
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateEventModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {selectedEvent && (
        <EventRegistrationSidebar
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          onRegister={() => {}}
        />
      )}
    </div>
  );
};

export default EventsPage;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, ArrowRight, MapPin, Users, Bell, ChevronRight } from 'lucide-react';
import { CreateEventModal } from '@/components/convene/CreateEventModal';
import EventRegistrationSidebar from '@/components/connect/EventRegistrationSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  // Categories for browsing (demo data - will be implemented in Phase 2)
  const eventCategories = [
    { id: 'tech', name: 'Technology', icon: '💻', count: '145 Events', color: 'bg-blue-500', description: 'Tech conferences, startup events, AI summits' },
    { id: 'business', name: 'Business & Finance', icon: '💼', count: '89 Events', color: 'bg-green-500', description: 'Investment forums, entrepreneurship workshops' },
    { id: 'culture', name: 'Arts & Culture', icon: '🎨', count: '67 Events', color: 'bg-purple-500', description: 'Art exhibitions, cultural festivals, music concerts' },
    { id: 'health', name: 'Health & Wellness', icon: '🏥', count: '45 Events', color: 'bg-red-500', description: 'Medical conferences, wellness workshops' },
    { id: 'education', name: 'Education', icon: '📚', count: '78 Events', color: 'bg-yellow-500', description: 'Academic conferences, skill development workshops' },
    { id: 'climate', name: 'Climate & Environment', icon: '🌍', count: '34 Events', color: 'bg-emerald-500', description: 'Climate action summits, sustainability workshops' },
  ];

  // Featured Calendars (demo data - will be implemented in Phase 2)
  const featuredCalendars = [
    {
      id: 'tech-innovators',
      name: 'African Tech Innovators',
      description: 'Curating the best tech events across Africa',
      logo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop',
      eventCount: 24,
      followers: 1200
    },
    {
      id: 'diaspora-invest',
      name: 'Diaspora Investment Circle',
      description: 'Investment opportunities and networking events',
      logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop',
      eventCount: 18,
      followers: 850
    },
    {
      id: 'women-leadership',
      name: 'Women Leadership Network',
      description: 'Empowering African women in leadership',
      logo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop',
      eventCount: 32,
      followers: 2100
    }
  ];

  // Local Events (demo data - will be implemented in Phase 2)
  const localEvents = [
    { city: 'Lagos', count: 23, flag: '🇳🇬', color: 'bg-green-600' },
    { city: 'Nairobi', count: 18, flag: '🇰🇪', color: 'bg-red-600' },
    { city: 'Cape Town', count: 15, flag: '🇿🇦', color: 'bg-blue-600' },
    { city: 'Accra', count: 12, flag: '🇬🇭', color: 'bg-yellow-600' },
    { city: 'London', count: 45, flag: '🇬🇧', color: 'bg-blue-800' },
    { city: 'New York', count: 38, flag: '🇺🇸', color: 'bg-red-700' }
  ];

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
                Explore events near you, browse by category, or check out featured calendars
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
                Popular Events ({events?.length || 0})
              </h3>
              <p className="text-sm text-muted-foreground">Trending events in your network</p>
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

        {/* Browse by Category Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Browse by Category</h3>
            <p className="text-sm text-muted-foreground">Find events that match your interests</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <TooltipProvider>
              {eventCategories.map((category) => (
                <Tooltip key={category.id}>
                  <TooltipTrigger asChild>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <h4 className="font-medium text-sm">{category.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{category.count}</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm">{category.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* Featured Calendars Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Featured Calendars</h3>
              <p className="text-sm text-muted-foreground">Curated event collections from community leaders</p>
            </div>
            <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TooltipProvider>
              {featuredCalendars.map((calendar) => (
                <Card key={calendar.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={calendar.logo}
                          alt={`${calendar.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{calendar.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{calendar.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{calendar.eventCount} events</span>
                          <span>{calendar.followers} followers</span>
                        </div>
                        <div className="mt-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7 px-2 hover:bg-dna-emerald hover:text-white transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Bell className="w-3 h-3 mr-1" />
                                Subscribe
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Get notified about new events from this calendar</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-dna-emerald transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TooltipProvider>
          </div>
        </div>

        {/* Explore Local Events Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Explore Local Events</h3>
            <p className="text-sm text-muted-foreground">Discover what's happening in major African cities and diaspora hubs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <TooltipProvider>
              {localEvents.map((location) => (
                <Tooltip key={location.city}>
                  <TooltipTrigger asChild>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 ${location.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                          <span className="text-2xl">{location.flag}</span>
                        </div>
                        <h4 className="font-medium text-sm">{location.city}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{location.count} Events</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Explore networking events, conferences, and community gatherings in {location.city}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
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

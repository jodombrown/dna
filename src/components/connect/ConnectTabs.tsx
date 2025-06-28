import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ProfessionalCard from './ProfessionalCard';
import CommunityCard from './CommunityCard';
import EventCard from './EventCard';
import EmptyState from './EmptyState';
import EventDetailDialog from "./EventDetailDialog";
import { Professional, Community, Event } from '@/types/search';
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConnectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  professionals: Professional[];
  communities: Community[];
  events: Event[];
  onConnect: (professionalId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
  onJoinCommunity: () => void;
  onRegisterEvent: () => void;
  getConnectionStatus: (professionalId: string) => any;
  isLoggedIn: boolean;
  onRefresh: () => void;
}

const ConnectTabs: React.FC<ConnectTabsProps> = ({
  activeTab,
  setActiveTab,
  professionals,
  communities,
  events,
  onConnect,
  onMessage,
  onJoinCommunity,
  onRegisterEvent,
  getConnectionStatus,
  isLoggedIn,
  onRefresh
}) => {
  // New state for selected event dialog
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  // Mock 5 creator profiles -- these would come from backend in real app
  const sampleCreators = [
    {
      id: "u1",
      full_name: "Dr. Amara Okafor",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: "u2",
      full_name: "Kwame Asante",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: "u3",
      full_name: "Sarah Mwangi",
      avatar_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: "u4",
      full_name: "Ibrahim Diallo",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      id: "u5",
      full_name: "Fatima Al-Rashid",
      avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face"
    }
  ];

  // Assign creators to first 5 events for demo
  const eventsWithCreators = events.map((event, idx) => {
    if (idx < 5 && !event.creator_profile) {
      return {
        ...event,
        creator_profile: sampleCreators[idx % sampleCreators.length]
      };
    }
    return event;
  });

  const openEventDialog = (event: Event) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  // Modern Event Card Component - Luma inspired
  const ModernEventCard = ({ event }: { event: Event }) => {
    // Event logo images - contextually relevant
    const getEventLogo = (eventTitle: string, eventType: string) => {
      if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
        return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop';
      }
      if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
        return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop';
      }
      if (eventTitle.toLowerCase().includes('health')) {
        return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop';
      }
      if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('leadership')) {
        return 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop';
      }
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop';
    };

    // Event banner images
    const getEventBanner = (eventTitle: string, eventType: string) => {
      if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
      }
      if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
        return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=200&fit=crop';
      }
      if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('networking')) {
        return 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=200&fit=crop';
      }
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop';
    };

    const eventLogo = getEventLogo(event.title, event.type);
    const eventBanner = event.banner_url || getEventBanner(event.title, event.type);
    const creatorImage = event.creator_profile?.avatar_url;

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl hover:-translate-y-1"
            onClick={() => openEventDialog(event)}>
        <div className="relative">
          <img
            src={eventBanner}
            alt={event.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Creator on banner - top right */}
          {event.creator_profile && (
            <button
              className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md hover:bg-dna-emerald/90 hover:text-white transition-all flex items-center gap-2 text-sm font-medium z-20"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${event.creator_profile.id}`);
              }}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={creatorImage} alt={event.creator_profile.full_name} />
                <AvatarFallback className="bg-dna-copper text-white text-xs">
                  {event.creator_profile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[80px] truncate">{event.creator_profile.full_name}</span>
            </button>
          )}

          {/* Event logo - bottom left overlap */}
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
              <img
                src={eventLogo}
                alt={`${event.title} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Virtual badge */}
          {event.is_virtual && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-dna-emerald/90 text-white border-0 backdrop-blur-sm">
                Virtual
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="pt-12 pb-6 px-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-dna-emerald transition-colors">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-medium">
                {event.type}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                }) : 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{event.attendee_count ?? 0} attending</span>
              </div>
            </div>

            <Button 
              className="w-full mt-4 bg-dna-emerald hover:bg-dna-forest text-white font-medium py-2.5 rounded-xl transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onRegisterEvent();
              }}
            >
              Register for Event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Categories for browsing
  const eventCategories = [
    { id: 'tech', name: 'Technology', icon: '💻', count: '145 Events', color: 'bg-blue-500' },
    { id: 'business', name: 'Business & Finance', icon: '💼', count: '89 Events', color: 'bg-green-500' },
    { id: 'culture', name: 'Arts & Culture', icon: '🎨', count: '67 Events', color: 'bg-purple-500' },
    { id: 'health', name: 'Health & Wellness', icon: '🏥', count: '45 Events', color: 'bg-red-500' },
    { id: 'education', name: 'Education', icon: '📚', count: '78 Events', color: 'bg-yellow-500' },
    { id: 'climate', name: 'Climate & Environment', icon: '🌍', count: '34 Events', color: 'bg-emerald-500' }
  ];

  // Featured Calendars/Communities
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

  // Local/Regional Events
  const localEvents = [
    { city: 'Lagos', count: 23, flag: '🇳🇬', color: 'bg-green-600' },
    { city: 'Nairobi', count: 18, flag: '🇰🇪', color: 'bg-red-600' },
    { city: 'Cape Town', count: 15, flag: '🇿🇦', color: 'bg-blue-600' },
    { city: 'Accra', count: 12, flag: '🇬🇭', color: 'bg-yellow-600' },
    { city: 'London', count: 45, flag: '🇬🇧', color: 'bg-blue-800' },
    { city: 'New York', count: 38, flag: '🇺🇸', color: 'bg-red-700' }
  ];

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
          <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="professionals">
          {professionals.length === 0 ? (
            <EmptyState type="professionals" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {professionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onConnect={() => onConnect(professional.id)}
                  onMessage={() => onMessage(professional.id, professional.full_name)}
                  connectionStatus={getConnectionStatus(professional.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="communities">
          {communities.length === 0 ? (
            <EmptyState type="communities" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onJoin={onJoinCommunity}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {eventsWithCreators.length === 0 ? (
            <EmptyState type="events" onRefresh={onRefresh} />
          ) : (
            <div className="space-y-12">
              {/* Header without Create Event Button */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Explore events near you, share opportunities with your network, and create meaningful connections through gatherings that matter
                </p>
              </div>

              {/* Popular Events Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Popular Events</h3>
                    <p className="text-gray-600">Trending events in your network</p>
                  </div>
                  <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {eventsWithCreators.slice(0, 6).map((event) => (
                        <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <ModernEventCard event={event} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    {/* Enhanced Carousel Navigation */}
                    <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white shadow-lg border-2 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all duration-200" />
                    <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white shadow-lg border-2 hover:bg-dna-emerald hover:text-white hover:border-dna-emerald transition-all duration-200" />
                  </Carousel>
                </div>
              </div>

              {/* Browse by Category Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Browse by Category</h3>
                  <p className="text-gray-600">Find events that match your interests</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {eventCategories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h4>
                        <p className="text-xs text-gray-500">{category.count}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Featured Calendars Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Featured Calendars</h3>
                    <p className="text-gray-600">Curated event collections from community leaders</p>
                  </div>
                  <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCalendars.map((calendar) => (
                    <Card key={calendar.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={calendar.logo}
                              alt={`${calendar.name} logo`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-2 truncate">{calendar.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{calendar.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="font-medium">{calendar.eventCount} events</span>
                              <span>{calendar.followers} followers</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-dna-emerald transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Explore Local Events Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Explore Local Events</h3>
                  <p className="text-gray-600">Discover what's happening in major African cities and diaspora hubs</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {localEvents.map((location) => (
                    <Card key={location.city} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 ${location.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-2xl">{location.flag}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{location.city}</h4>
                        <p className="text-xs text-gray-500">{location.count} Events</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <EventDetailDialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) setTimeout(() => setSelectedEvent(null), 200);
        }}
        event={selectedEvent}
        onRegister={onRegisterEvent}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
};

export default ConnectTabs;

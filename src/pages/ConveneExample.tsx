import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, ArrowRight, ChevronRight, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import FeedbackPanel from '@/components/FeedbackPanel';
import PageSpecificSurvey from '@/components/survey/PageSpecificSurvey';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const ConveneExample = () => {
  useScrollToTop();
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  // Popular/Featured Events
  const popularEvents = [
    {
      id: '1',
      title: 'African Tech Leaders Summit 2024',
      description: 'Annual gathering of tech leaders driving innovation across Africa and the diaspora.',
      type: 'Conference',
      date: '2024-12-15',
      time: '09:00',
      location: 'Lagos, Nigeria',
      isVirtual: false,
      attendeeCount: 450,
      isFeatured: true,
      eventLogo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop',
      creatorName: 'Dr. Amina Hassan',
      creatorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: '2',
      title: 'Diaspora Investment Forum',
      description: 'Connecting diaspora investors with African startups and impact opportunities.',
      type: 'Forum',
      date: '2025-01-22',
      time: '14:00',
      location: 'Virtual Event',
      isVirtual: true,
      attendeeCount: 280,
      isFeatured: true,
      eventLogo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=200&fit=crop',
      creatorName: 'Prof. Kwame Asante',
      creatorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: '3',
      title: 'Women in Finance Networking',
      description: 'Professional networking and mentorship event for African women in financial services.',
      type: 'Workshop',
      date: '2024-12-28',
      time: '18:00',
      location: 'Toronto, Canada',
      isVirtual: false,
      attendeeCount: 120,
      isFeatured: false,
      eventLogo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=200&fit=crop',
      creatorName: 'Ibrahim Diallo',
      creatorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: '4',
      title: 'Sustainable Energy Meetup',
      description: 'Dive deep into renewable energy projects and sustainability initiatives across Africa.',
      type: 'Meetup',
      date: '2025-02-05',
      time: '12:00',
      location: 'Berlin, Germany',
      isVirtual: false,
      attendeeCount: 65,
      isFeatured: false,
      eventLogo: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&h=200&fit=crop',
      creatorName: 'Sarah Mwangi',
      creatorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=80&h=80&fit=crop&crop=face'
    },
    {
      id: '5',
      title: 'HealthTech Innovation Forum',
      description: 'Explore cutting-edge digital health solutions transforming African healthcare delivery.',
      type: 'Forum',
      date: '2025-02-10',
      time: '14:00',
      location: 'Virtual Event',
      isVirtual: true,
      attendeeCount: 350,
      isFeatured: true,
      eventLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&h=120&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=200&fit=crop',
      creatorName: 'Fatima Al-Rashid',
      creatorImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
    }
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
    },
    {
      id: 'climate-action',
      name: 'Climate Action Alliance',
      description: 'Environmental sustainability and green energy forums',
      logo: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=120&h=120&fit=crop',
      eventCount: 28,
      followers: 1650
    }
  ];

  // Categories for browsing
  const eventCategories = [
    { 
      id: 'tech', 
      name: 'Technology', 
      icon: '💻', 
      count: '145 Events', 
      color: 'bg-blue-500',
      description: 'Tech conferences, startup events, AI summits, coding bootcamps, and digital innovation workshops'
    },
    { 
      id: 'business', 
      name: 'Business & Finance', 
      icon: '💼', 
      count: '89 Events', 
      color: 'bg-green-500',
      description: 'Investment forums, entrepreneurship workshops, trade missions, and business networking events'
    },
    { 
      id: 'culture', 
      name: 'Arts & Culture', 
      icon: '🎨', 
      count: '67 Events', 
      color: 'bg-purple-500',
      description: 'Art exhibitions, cultural festivals, music concerts, film screenings, and creative showcases'
    },
    { 
      id: 'health', 
      name: 'Health & Wellness', 
      icon: '🏥', 
      count: '45 Events', 
      color: 'bg-red-500',
      description: 'Medical conferences, wellness workshops, mental health seminars, and healthcare innovation forums'
    },
    { 
      id: 'education', 
      name: 'Education', 
      icon: '📚', 
      count: '78 Events', 
      color: 'bg-yellow-500',
      description: 'Academic conferences, skill development workshops, scholarships info sessions, and educational seminars'
    },
    { 
      id: 'climate', 
      name: 'Climate & Environment', 
      icon: '🌍', 
      count: '34 Events', 
      color: 'bg-emerald-500',
      description: 'Climate action summits, sustainability workshops, green energy forums, and environmental conservation events'
    }
  ];

  // Local/Regional Events
  const localEvents = [
    { city: 'Lagos', country: 'Nigeria', count: 23, flag: '🇳🇬', color: 'bg-green-600' },
    { city: 'Nairobi', country: 'Kenya', count: 18, flag: '🇰🇪', color: 'bg-red-600' },
    { city: 'Cape Town', country: 'South Africa', count: 15, flag: '🇿🇦', color: 'bg-blue-600' },
    { city: 'Accra', country: 'Ghana', count: 12, flag: '🇬🇭', color: 'bg-yellow-600' },
    { city: 'London', country: 'United Kingdom', count: 45, flag: '🇬🇧', color: 'bg-blue-800' },
    { city: 'New York', country: 'United States', count: 38, flag: '🇺🇸', color: 'bg-red-700' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Create Event Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-16">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Discover Events</h1>
            <p className="text-gray-600 mt-2">
              Explore events near you, browse by category, or check out featured calendars
            </p>
          </div>
          <EnhancedButton variant="dna" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </EnhancedButton>
        </div>

        {/* Popular Events Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Events ({popularEvents.length})
              </h2>
              <p className="text-sm text-gray-600">Trending events in your network</p>
            </div>
            <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {popularEvents.map((event) => (
                <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                    <div className="relative">
                      <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Event Logo */}
                      <div className="absolute -bottom-6 left-4">
                        <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden bg-white">
                          <img
                            src={event.eventLogo}
                            alt={`${event.title} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {/* Creator */}
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 shadow-sm">
                          <img
                            src={event.creatorImage}
                            alt={event.creatorName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-gray-700 max-w-[60px] truncate">
                            {event.creatorName}
                          </span>
                        </div>
                      </div>
                      {event.isVirtual && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-dna-emerald text-white text-xs">Virtual</Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="pt-8 pb-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{event.description}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{event.type}</Badge>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.attendeeCount} attending</span>
                          </div>
                        </div>
                        
                        <EnhancedButton variant="dna-outline" size="sm" className="w-full mt-2">
                          Register for Event
                        </EnhancedButton>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Browse by Category Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-sm text-gray-600">Find events that match your interests</p>
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
                        <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{category.count}</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Featured Calendars</h2>
              <p className="text-sm text-gray-600">Curated event collections from community leaders</p>
            </div>
            <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <h3 className="font-semibold text-gray-900 truncate">{calendar.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{calendar.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{calendar.eventCount} events</span>
                          <span>{calendar.followers} followers</span>
                        </div>
                        <div className="mt-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7 px-2 hover:bg-dna-emerald hover:text-white transition-colors w-full"
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
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-dna-emerald transition-colors" />
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
            <h2 className="text-2xl font-bold text-gray-900">Explore Local Events</h2>
            <p className="text-sm text-gray-600">See what's happening in major cities and diaspora hubs</p>
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
                        <h3 className="font-medium text-gray-900 text-sm">{location.city}</h3>
                        <p className="text-xs text-gray-500">{location.country}</p>
                        <p className="text-xs text-gray-500 mt-1">{location.count} Events</p>
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

        {/* Page-specific Survey CTA */}
        <div className="mt-12 bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-emerald/20">
          <h3 className="text-2xl font-bold text-dna-forest mb-4">
            Help Us Improve Event Experiences
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your thoughts on diaspora gatherings and networking events. 
            Your feedback will shape how we bring the community together.
          </p>
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Share Your Convene Experience
          </button>
        </div>
      </main>

      <Footer />

      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="convene"
      />
      
      <PageSpecificSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageType="convene"
      />
    </div>
  );
};

export default ConveneExample;

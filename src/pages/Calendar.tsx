
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FullCalendarView from '@/components/calendar/FullCalendarView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Filter, Download, Share2 } from 'lucide-react';
import { Event } from '@/types/search';
import { toast } from 'sonner';

// Mock events data - in a real app, this would come from your API
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'African Tech Summit 2025',
    description: 'The premier technology conference connecting African innovators with global opportunities',
    date_time: '2025-09-15T09:00:00Z',
    location: 'Lagos, Nigeria',
    type: 'conference',
    attendee_count: 2500,
    max_attendees: 3000,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-01-01T00:00:00Z',
    created_by: 'user1',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'Diaspora Investment Roundtable',
    description: 'Exclusive roundtable discussion on African investment opportunities',
    date_time: '2025-08-12T14:00:00Z',
    location: 'New York, NY',
    type: 'roundtable',
    attendee_count: 50,
    max_attendees: 50,
    is_featured: false,
    is_virtual: false,
    created_at: '2025-01-01T00:00:00Z',
    created_by: 'user2'
  },
  {
    id: '3',
    title: 'Women in African Business Webinar',
    description: 'Empowering women entrepreneurs across the African continent',
    date_time: '2025-07-08T19:00:00Z',
    location: 'Virtual Event',
    type: 'webinar',
    attendee_count: 1000,
    is_featured: false,
    is_virtual: true,
    created_at: '2025-01-01T00:00:00Z',
    created_by: 'user3'
  },
  {
    id: '4',
    title: 'Innovation Pitch Night',
    description: 'Showcase your startup to a panel of diaspora investors and mentors',
    date_time: '2025-12-05T18:00:00Z',
    location: 'London, UK + Virtual',
    type: 'pitch',
    attendee_count: 200,
    max_attendees: 250,
    is_featured: true,
    is_virtual: false,
    created_at: '2025-01-01T00:00:00Z',
    created_by: 'user4'
  },
  {
    id: '5',
    title: 'AgriTech Innovation Summit',
    description: 'Revolutionizing African agriculture through technology and innovation',
    date_time: '2025-07-18T13:00:00Z',
    location: 'Virtual Event',
    type: 'conference',
    attendee_count: 1500,
    is_featured: false,
    is_virtual: true,
    created_at: '2025-01-01T00:00:00Z',
    created_by: 'user5'
  }
];

const Calendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading events
    const loadEvents = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setLoading(false);
    };

    loadEvents();
  }, []);

  const handleEventSelect = (event: Event) => {
    console.log('Event selected:', event);
  };

  const handleEventRegister = (event: Event) => {
    toast.success(`Registration request sent for: ${event.title}`);
  };

  const handleExportCalendar = () => {
    toast.success('Calendar export feature coming soon!');
  };

  const handleShareCalendar = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Calendar link copied to clipboard!');
  };

  const filteredEvents = events.filter(event => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.some(filter => 
      event.type === filter || 
      (filter === 'virtual' && event.is_virtual) ||
      (filter === 'featured' && event.is_featured)
    );
  });

  const upcomingEventsCount = events.filter(event => 
    new Date(event.date_time) > new Date()
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Event <span className="text-dna-emerald">Calendar</span>
            </h1>
            <p className="text-gray-600">
              Discover and track diaspora events, opportunities, and community gatherings
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-dna-emerald border-dna-emerald">
              {upcomingEventsCount} Upcoming Events
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCalendar}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareCalendar}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4" />
              Quick Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['conference', 'webinar', 'roundtable', 'pitch', 'virtual', 'featured'].map(filter => (
                <Badge
                  key={filter}
                  variant={selectedFilters.includes(filter) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedFilters.includes(filter) 
                      ? 'bg-dna-emerald hover:bg-dna-forest text-white' 
                      : 'hover:bg-dna-emerald hover:text-white'
                  }`}
                  onClick={() => {
                    setSelectedFilters(prev => 
                      prev.includes(filter) 
                        ? prev.filter(f => f !== filter)
                        : [...prev, filter]
                    );
                  }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Badge>
              ))}
              
              {selectedFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFilters([])}
                  className="text-gray-500 hover:text-gray-700 h-6 px-2"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <FullCalendarView
          events={filteredEvents}
          onEventSelect={handleEventSelect}
          onEventRegister={handleEventRegister}
        />

        {/* Calendar Instructions */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <CalendarPlus className="w-8 h-8 text-dna-emerald mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Add to Your Calendar</h4>
                <p className="text-gray-600">
                  Click on any event to add it directly to Google Calendar, Outlook, or download as .ics file
                </p>
              </div>
              
              <div className="text-center">
                <Filter className="w-8 h-8 text-dna-copper mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Smart Filtering</h4>
                <p className="text-gray-600">
                  Use the filter badges above to quickly find events by type, format, or priority
                </p>
              </div>
              
              <div className="text-center">
                <Share2 className="w-8 h-8 text-dna-gold mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Share & Export</h4>
                <p className="text-gray-600">
                  Share your calendar view with others or export events for external calendar apps
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { format } from 'date-fns';

const EventsIndex = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('upcoming');

  // Fetch events with filters
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-index', searchTerm, formatFilter, typeFilter, timeFilter],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_cancelled', false);

      // Time filter
      const now = new Date().toISOString();
      if (timeFilter === 'upcoming') {
        query = query.gte('start_time', now);
      } else if (timeFilter === 'today') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        query = query
          .gte('start_time', now)
          .lte('start_time', endOfDay.toISOString());
      } else if (timeFilter === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        query = query
          .gte('start_time', now)
          .lte('start_time', weekFromNow.toISOString());
      } else if (timeFilter === 'month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        query = query
          .gte('start_time', now)
          .lte('start_time', monthFromNow.toISOString());
      }

      // Format filter
      if (formatFilter !== 'all') {
        const formatValue = formatFilter as 'in_person' | 'virtual' | 'hybrid';
        query = query.eq('format', formatValue);
      }

      // Type filter
      if (typeFilter !== 'all') {
        const typeValue = typeFilter as 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other';
        query = query.eq('event_type', typeValue);
      }

      // Search
      if (searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location_city.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query
        .order('start_time', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      // Fetch organizer profiles separately
      if (!data || data.length === 0) return [];
      
      const organizerIds = [...new Set(data.map(e => e.organizer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', organizerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(event => ({
        ...event,
        organizer: profileMap.get(event.organizer_id)
      }));
    },
  });

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Events</h1>
            <p className="text-muted-foreground">Discover and join events in your community</p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/dna/convene/create')}>
                Create Event
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meetup">Meetup</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-muted-foreground">Loading events...</div>
              </div>
            </div>
          ) : events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No events found</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or create a new event
                </p>
                <Button onClick={() => navigate('/dna/convene/create')}>
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <Card 
                  key={event.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/dna/convene/events/${event.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {event.event_type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {event.format.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.start_time), 'PPP')}</span>
                      </div>
                      {(event.location_city || event.location_country) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[event.location_city, event.location_country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                      {event.organizer && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">
                            by {event.organizer.full_name || event.organizer.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      }
      rightColumn={<RightWidgets />}
    />
  );
};

export default EventsIndex;

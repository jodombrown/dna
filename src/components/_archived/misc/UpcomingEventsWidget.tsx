import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface UpcomingEventsWidgetProps {
  userId: string;
  limit?: number;
}

export const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({ 
  userId, 
  limit = 3 
}) => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['upcoming-events', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          event_id,
          status,
          events (
            id,
            title,
            description,
            start_time,
            end_time,
            location,
            location_type,
            organizer_id,
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .in('status', ['going', 'maybe'])
        .gte('events.start_time', new Date().toISOString())
        .order('events(start_time)', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data?.map(d => (d as any).events).filter(Boolean) || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasEvents = events && events.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Events</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dna/convene/events')}
            className="text-dna-copper hover:text-dna-copper/80"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasEvents ? (
          <div className="text-center py-8">
            <div className="mb-4 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">No upcoming events</p>
              <p className="text-sm">Browse events and RSVP to stay connected</p>
            </div>
            <Button onClick={() => navigate('/dna/convene/events')} variant="outline">
              Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => (
              <div
                key={event.id}
                onClick={() => navigate(`/dna/convene/events/${event.id}`)}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <h4 className="font-semibold text-sm mb-2 line-clamp-1">
                  {event.title}
                </h4>
                
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(event.start_time), 'PPP')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {event.location_type === 'virtual' ? 'Virtual Event' : event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * FeedUpcomingEvents - Left sidebar widget showing upcoming events for the user
 * Cross-C moment: CONVENE surfaces on every feed visit
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isTomorrow } from 'date-fns';

interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
  location_name: string | null;
}

export const FeedUpcomingEvents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery({
    queryKey: ['feed-upcoming-events', user?.id],
    queryFn: async (): Promise<UpcomingEvent[]> => {
      if (!user?.id) return [];

      // Get events the user is attending that are upcoming
      const { data } = await supabase
        .from('event_attendees')
        .select('event_id, events!inner(id, title, start_time, location_name)')
        .eq('user_id', user.id)
        .eq('status', 'going')
        .gt('events.start_time', new Date().toISOString())
        .order('events(start_time)', { ascending: true })
        .limit(3);

      if (!data) return [];

      return data.map((row) => {
        const evt = row.events as unknown as UpcomingEvent;
        return {
          id: evt.id,
          title: evt.title,
          start_time: evt.start_time,
          location_name: evt.location_name,
        };
      });
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !events || events.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, 'EEE, MMM d');
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming For You
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="space-y-2">
          {events.map((evt) => (
            <button
              key={evt.id}
              className="w-full text-left hover:bg-muted rounded-md p-2 -mx-0.5 transition-colors group"
              onClick={() => navigate(`/dna/convene/events/${evt.id}`)}
            >
              <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {evt.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {formatDate(evt.start_time)}
                </span>
                {evt.location_name && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="truncate max-w-[100px]">{evt.location_name}</span>
                    </span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-xs h-7"
          onClick={() => navigate('/dna/convene')}
        >
          View All Events
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

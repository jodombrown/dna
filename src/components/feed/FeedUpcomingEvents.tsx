/**
 * FeedUpcomingEvents - Beautiful upcoming events widget for left sidebar
 * Cross-C moment: CONVENE surfaces on every feed visit
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
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

  const getDateParts = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: format(date, 'MMM').toUpperCase(),
      day: format(date, 'd'),
    };
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[hsl(var(--dna-amber,40,90%,50%))]" />
          Upcoming For You
        </h3>
      </div>

      {/* Event list */}
      <div className="px-2 pb-2 space-y-0.5">
        {events.map((evt) => {
          const dateParts = getDateParts(evt.start_time);
          return (
            <button
              key={evt.id}
              className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors group text-left"
              onClick={() => navigate(`/dna/convene/events/${evt.id}`)}
            >
              {/* Luma-style date box */}
              <div className="shrink-0 w-10 h-10 rounded-lg bg-[hsl(var(--dna-amber,40,90%,50%)/0.1)] border border-[hsl(var(--dna-amber,40,90%,50%)/0.2)] flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-[hsl(var(--dna-amber,40,90%,50%))] leading-none">
                  {dateParts.month}
                </span>
                <span className="text-sm font-bold text-foreground leading-none mt-0.5">
                  {dateParts.day}
                </span>
              </div>
              {/* Event info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1 group-hover:text-[hsl(var(--dna-emerald))] transition-colors">
                  {evt.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <span>{formatDate(evt.start_time)}</span>
                  {evt.location_name && (
                    <>
                      <span>·</span>
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{evt.location_name}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer link */}
      <button
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        onClick={() => navigate('/dna/convene')}
      >
        View All Events
        <ChevronRight className="h-3 w-3" />
      </button>
    </Card>
  );
};

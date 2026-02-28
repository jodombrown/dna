/**
 * FeedEventsCarousel — Vertical stack of upcoming event mini-cards for the right rail
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { format, isToday, isTomorrow } from 'date-fns';

interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
  location_name: string | null;
}

export const FeedEventsCarousel: React.FC = () => {
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
        .limit(4);

      if (!data) return [];

      return data.map((row) => {
        const evt = row.events as unknown as UpcomingEvent;
        return { id: evt.id, title: evt.title, start_time: evt.start_time, location_name: evt.location_name };
      });
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, 'EEE, MMM d');
  };

  const getDateParts = (dateStr: string) => {
    const date = new Date(dateStr);
    return { month: format(date, 'MMM').toUpperCase(), day: format(date, 'd') };
  };

  if (isLoading) return null;

  return (
    <div className="bg-card rounded-dna-xl border border-border/40 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-dna-gold" />
          <h3 className="text-sm font-semibold">Upcoming For You</h3>
          {events && events.length > 0 && (
            <span className="text-[10px] font-medium bg-[hsl(var(--dna-gold)/0.12)] text-dna-gold px-1.5 py-0.5 rounded-full">
              {events.length}
            </span>
          )}
        </div>
      </div>

      {/* Event list or empty state */}
      {!events || events.length === 0 ? (
        <div className="text-center py-4">
          <Calendar className="h-7 w-7 mx-auto text-dna-gold opacity-50 mb-2" />
          <p className="text-xs text-muted-foreground">No upcoming events</p>
          <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => navigate('/dna/convene')}>
            Explore Events <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((evt) => {
            const dateParts = getDateParts(evt.start_time);
            return (
              <button
                key={evt.id}
                className="w-full flex items-center gap-3 p-2.5 rounded-dna-lg bg-[hsl(var(--dna-gold)/0.04)] border border-[hsl(var(--dna-gold)/0.12)] hover:border-[hsl(var(--dna-gold)/0.3)] hover:shadow-dna-1 transition-all text-left group"
                onClick={() => navigate(`/dna/convene/events/${evt.id}`)}
              >
                {/* Date box */}
                <div className="shrink-0 w-10 h-10 rounded-lg bg-[hsl(var(--dna-gold)/0.12)] border border-[hsl(var(--dna-gold)/0.2)] flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-dna-gold leading-none">{dateParts.month}</span>
                  <span className="text-sm font-bold text-foreground leading-none mt-0.5">{dateParts.day}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-1 group-hover:text-dna-gold transition-colors">{evt.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(evt.start_time)}</p>
                  {evt.location_name && (
                    <p className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {evt.location_name}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          <button
            className="w-full text-center py-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            onClick={() => navigate('/dna/convene')}
          >
            View All Events →
          </button>
        </div>
      )}
    </div>
  );
};

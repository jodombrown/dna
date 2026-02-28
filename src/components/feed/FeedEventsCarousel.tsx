/**
 * FeedEventsCarousel — Horizontal scrollable row of upcoming event mini-cards
 * Full-width carousel using CSS scroll-snap for the dashboard widgets row
 */

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
        .limit(8);

      if (!data) return [];

      return data.map((row) => {
        const evt = row.events as unknown as UpcomingEvent;
        return { id: evt.id, title: evt.title, start_time: evt.start_time, location_name: evt.location_name };
      });
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

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

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="bg-card rounded-dna-xl shadow-dna-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-dna-gold" />
          <h3 className="font-heritage text-sm font-semibold">Upcoming For You</h3>
        </div>
        <div className="text-center py-4">
          <Calendar className="h-8 w-8 mx-auto text-dna-gold opacity-50 mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming events</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 text-xs"
            onClick={() => navigate('/dna/convene')}
          >
            Explore Events
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-dna-xl shadow-dna-1 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-dna-gold" />
          <h3 className="font-heritage text-sm font-semibold">Upcoming For You</h3>
          <span className="text-[10px] font-medium bg-[hsl(var(--dna-gold)/0.12)] text-dna-gold px-1.5 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
      >
        {events.map((evt) => {
          const dateParts = getDateParts(evt.start_time);
          return (
            <button
              key={evt.id}
              className="snap-start shrink-0 w-[240px] flex items-start gap-3 p-3 rounded-dna-lg bg-[hsl(var(--dna-gold)/0.04)] border border-[hsl(var(--dna-gold)/0.15)] hover:border-[hsl(var(--dna-gold)/0.3)] hover:shadow-dna-1 transition-all text-left group"
              onClick={() => navigate(`/dna/convene/events/${evt.id}`)}
            >
              {/* Date box */}
              <div className="shrink-0 w-12 h-12 rounded-lg bg-[hsl(var(--dna-gold)/0.12)] border border-[hsl(var(--dna-gold)/0.25)] flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-dna-gold leading-none">{dateParts.month}</span>
                <span className="text-base font-bold text-foreground leading-none mt-0.5">{dateParts.day}</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1 group-hover:text-dna-gold transition-colors">
                  {evt.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(evt.start_time)}</p>
                {evt.location_name && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {evt.location_name}
                  </p>
                )}
              </div>
            </button>
          );
        })}

        {/* "View All" card */}
        <button
          className="snap-start shrink-0 w-[140px] flex flex-col items-center justify-center rounded-dna-lg border border-dashed border-border/60 hover:border-dna-gold/40 hover:bg-[hsl(var(--dna-gold)/0.04)] transition-all text-center"
          onClick={() => navigate('/dna/convene')}
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground mb-1" />
          <span className="text-xs font-medium text-muted-foreground">View All Events</span>
        </button>
      </div>
    </div>
  );
};

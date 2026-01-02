/**
 * ConveneFocus - Focus Mode Content for Convene Module
 *
 * Displays actionable Convene content including:
 * - Upcoming RSVPed events
 * - Event invitations
 * - Recommended events based on interests
 * - Aspiration mode for when events feature is launching
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Globe, Clock, Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useConveneFocusData, type UpcomingEvent, type RecommendedEvent } from '@/hooks/useConveneFocusData';

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatEventTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function UpcomingEventCard({ event }: { event: UpcomingEvent }) {
  return (
    <Link
      to={`/dna/convene/events/${event.id}`}
      className="block p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
    >
      {event.coverImageUrl && (
        <div className="w-full h-20 mb-2 rounded-md overflow-hidden">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h4 className="font-medium text-sm text-neutral-900 line-clamp-2">
        {event.title}
      </h4>
      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatEventDate(event.startTime)}
        </span>
        <span className="flex items-center gap-1">
          {event.isVirtual ? (
            <>
              <Globe className="w-3 h-3" />
              Virtual
            </>
          ) : (
            <>
              <MapPin className="w-3 h-3" />
              {event.location || 'TBA'}
            </>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            event.status === 'going'
              ? 'bg-dna-emerald/10 text-dna-emerald'
              : 'bg-dna-sunset/10 text-dna-sunset'
          )}
        >
          {event.status === 'going' ? 'Going' : 'Maybe'}
        </span>
      </div>
    </Link>
  );
}

function RecommendedEventCard({ event }: { event: RecommendedEvent }) {
  return (
    <Link
      to={`/dna/convene/events/${event.id}`}
      className="block p-3 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors"
    >
      <h4 className="font-medium text-sm text-neutral-900 line-clamp-2">
        {event.title}
      </h4>
      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatEventDate(event.startTime)}
        </span>
        <span className="flex items-center gap-1">
          {event.isVirtual ? (
            <>
              <Globe className="w-3 h-3" />
              Virtual
            </>
          ) : (
            <>
              <MapPin className="w-3 h-3" />
              {event.location || 'TBA'}
            </>
          )}
        </span>
      </div>
      {event.matchReason && (
        <p className="text-xs text-dna-purple mt-2">{event.matchReason}</p>
      )}
    </Link>
  );
}

function AspirationMode() {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dna-sunset/10 flex items-center justify-center">
        <Calendar className="w-8 h-8 text-dna-sunset" />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">Events are coming soon</h3>
      <p className="text-sm text-neutral-500 mb-4">
        From virtual summits to city meetups — the diaspora will gather here.
      </p>
      <div className="space-y-2">
        <Button variant="outline" className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          Notify Me When Events Launch
        </Button>
        <Link to="/dna/convene/host-interest">
          <Button variant="ghost" className="w-full text-dna-emerald">
            Apply to Host an Event
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ConveneFocus() {
  const {
    upcomingEvents,
    recommendedEvents,
    isLoading,
    upcomingCount,
  } = useConveneFocusData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-dna-emerald" />
      </div>
    );
  }

  // Show aspiration mode if no upcoming events and no recommendations
  if (upcomingCount === 0 && recommendedEvents.length === 0) {
    return <AspirationMode />;
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      {upcomingCount > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Your Upcoming Events ({upcomingCount})
            </h3>
            {upcomingCount > 2 && (
              <Link
                to="/dna/convene/my-events"
                className="text-xs text-dna-emerald hover:underline"
              >
                View All
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 2).map((event) => (
              <UpcomingEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended Events */}
      {recommendedEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Events For You
            </h3>
            <Link
              to="/dna/convene"
              className="text-xs text-dna-emerald hover:underline"
            >
              Browse All
            </Link>
          </div>
          <div className="space-y-2">
            {recommendedEvents.slice(0, 2).map((event) => (
              <RecommendedEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ConveneFocus;

/**
 * DNA | FEED v2 - Event Card
 *
 * Renders events with date badge, timezone display, attendee preview, inline RSVP.
 */

import React from 'react';
import { FeedCardShell } from './FeedCardShell';
import { EngagementBar } from '../EngagementBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Video, Users, Clock } from 'lucide-react';
import type { FeedItem, EventFeedContent } from '@/types/feedTypes';

interface EventFeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentId: string) => void;
}

const EVENT_TYPE_ICONS = {
  in_person: MapPin,
  virtual: Video,
  hybrid: Users,
};

export const EventFeedCard: React.FC<EventFeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
}) => {
  const content = item.content as EventFeedContent;
  const EventTypeIcon = EVENT_TYPE_ICONS[content.eventType] || Calendar;

  const startDate = new Date(content.startDateTime);
  const month = startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = startDate.getDate();

  return (
    <FeedCardShell
      contentType="event"
      primaryC={item.primaryC}
      author={item.createdBy}
      createdAt={item.createdAt}
      onClick={() => onNavigate?.(item.contentId)}
    >
      {/* Cover image */}
      {content.coverImageUrl && (
        <div className="mb-3 -mx-4 md:mx-0 relative">
          <img
            src={content.coverImageUrl}
            alt={content.title}
            className="w-full h-40 md:h-48 object-cover md:rounded-lg"
            loading="lazy"
          />
          {/* Date badge overlay */}
          <div className="absolute top-3 left-3 md:left-3 bg-white dark:bg-card rounded-lg shadow-md p-2 text-center min-w-[48px]">
            <span className="block text-[10px] font-bold text-dna-gold uppercase">{month}</span>
            <span className="block text-lg font-bold leading-none">{day}</span>
          </div>
        </div>
      )}

      {/* If no cover image, show inline date badge */}
      {!content.coverImageUrl && (
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-dna-gold/10 rounded-lg p-2 text-center min-w-[48px] shrink-0">
            <span className="block text-[10px] font-bold text-dna-gold uppercase">{month}</span>
            <span className="block text-lg font-bold leading-none">{day}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-tight line-clamp-2">
              {content.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {content.description}
            </p>
          </div>
        </div>
      )}

      {/* Title (when cover image exists) */}
      {content.coverImageUrl && (
        <>
          <h3 className="text-base font-semibold leading-tight line-clamp-2 mb-1">
            {content.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {content.description}
          </p>
        </>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {content.viewerLocalTime || startDate.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <EventTypeIcon className="w-3.5 h-3.5" />
          {content.eventType === 'in_person' && content.physicalLocation
            ? `${content.physicalLocation.city}, ${content.physicalLocation.country}`
            : content.eventType === 'virtual'
              ? 'Virtual'
              : 'Hybrid'}
        </span>
        {content.ticketType === 'free' ? (
          <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">
            Free
          </Badge>
        ) : content.ticketPrice ? (
          <Badge variant="outline" className="text-[10px]">
            {content.ticketPrice.displayText}
          </Badge>
        ) : null}
      </div>

      {/* Attendees preview */}
      {content.attendees.totalCount > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {content.attendees.connectionAttendees.slice(0, 3).map((a) => (
              <Avatar key={a.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={a.avatarUrl || undefined} />
                <AvatarFallback className="text-[8px]">
                  {a.displayName[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {content.attendees.connectionCount > 0
              ? `${content.attendees.connectionCount} connection${content.attendees.connectionCount !== 1 ? 's' : ''} attending`
              : `${content.attendees.totalCount} attending`}
          </span>
        </div>
      )}

      {/* Capacity */}
      {content.capacity && content.spotsRemaining !== null && content.spotsRemaining <= 10 && (
        <p className="text-xs font-medium text-orange-600 mb-3">
          Only {content.spotsRemaining} spot{content.spotsRemaining !== 1 ? 's' : ''} remaining
        </p>
      )}

      {/* RSVP button */}
      <div className="mb-3">
        <Button
          size="sm"
          className="h-9 text-xs w-full bg-[#C4942A] hover:bg-[#C4942A]/90"
          onClick={(e) => {
            e.stopPropagation();
            onEngagementToggle(item.id, 'rsvp');
          }}
        >
          {content.isRSVPd ? 'Going' : 'RSVP'}
        </Button>
      </div>

      <EngagementBar
        contentType="event"
        engagement={item.engagement}
        feedItemId={item.id}
        onToggle={onEngagementToggle}
      />
    </FeedCardShell>
  );
};

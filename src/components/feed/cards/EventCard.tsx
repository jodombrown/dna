/**
 * Event Card for Universal Feed
 * 
 * Design System v2.1 Implementation:
 * - 2px Warm Amber full border (#F59E0B)
 * - Fetches event details for rich display
 * - Expandable card like StoryCard with "Learn More" / "Show Less"
 * - RSVP CTA button
 * - Proper title display (never "Upcoming Event" as header)
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Video, 
  Globe,
  ChevronDown,
  ChevronUp,
  CalendarDays
} from 'lucide-react';
import { format as formatDate, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PostMenuOwn } from '@/components/posts/PostMenuOwn';
import { PostMenuOthers } from '@/components/posts/PostMenuOthers';
import { useEventDetailsForFeed } from '@/hooks/useEventDetailsForFeed';
import { Skeleton } from '@/components/ui/skeleton';

interface EventCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isOwnEvent = item.author_id === currentUserId;
  
  // Fetch full event details
  const { data: eventDetails, isLoading } = useEventDetailsForFeed(item.event_id);

  // Use fetched event details or fall back to feed item data
  const title = eventDetails?.title || item.event_title || item.title || 'Event';
  const description = eventDetails?.description || eventDetails?.short_description || item.content || '';
  const coverImage = eventDetails?.cover_image_url || item.media_url;
  const startTime = eventDetails?.start_time;
  const endTime = eventDetails?.end_time;
  const eventFormat = eventDetails?.format;
  const locationName = eventDetails?.location_name;
  const locationCity = eventDetails?.location_city;
  const locationCountry = eventDetails?.location_country;
  const attendeeCount = eventDetails?.attendee_count || 0;
  const maxAttendees = eventDetails?.max_attendees;
  const slug = eventDetails?.slug || item.event_id;
  const organizerName = eventDetails?.organizer_name || item.author_display_name;
  const organizerAvatar = eventDetails?.organizer_avatar || item.author_avatar_url;

  // Parse event dates
  const startDate = startTime ? parseISO(startTime) : null;
  const endDate = endTime ? parseISO(endTime) : null;
  const monthAbbrev = startDate ? formatDate(startDate, 'MMM').toUpperCase() : '';
  const dayNumber = startDate ? formatDate(startDate, 'd') : '';
  const dayOfWeek = startDate ? formatDate(startDate, 'EEEE') : '';
  const fullDate = startDate ? formatDate(startDate, 'MMMM d, yyyy') : '';
  const timeRange = startDate 
    ? `${formatDate(startDate, 'h:mm a')}${endDate ? ` - ${formatDate(endDate, 'h:mm a')}` : ''}`
    : '';

  // Build location string
  const getLocationInfo = () => {
    if (eventFormat === 'virtual') {
      return { 
        icon: Video, 
        primary: 'Virtual Event', 
        secondary: eventDetails?.meeting_platform || 'Online' 
      };
    }
    if (eventFormat === 'hybrid') {
      const locationParts = [locationName, locationCity].filter(Boolean);
      return { 
        icon: Globe, 
        primary: 'Hybrid Event', 
        secondary: locationParts.length > 0 ? locationParts.join(', ') : null 
      };
    }
    // In-person or unknown format
    const locationParts = [locationName, locationCity, locationCountry].filter(Boolean);
    if (locationParts.length === 0) {
      return null; // Don't show "Location TBD" - just hide the section
    }
    return { 
      icon: MapPin, 
      primary: locationParts[0], 
      secondary: locationParts.slice(1).join(', ') || null 
    };
  };

  const locationInfo = getLocationInfo();
  
  // Preview text for collapsed state
  const descriptionPreview = description.slice(0, 150);
  const needsExpansion = description.length > 150;

  const handleCardClick = () => {
    if (slug) {
      navigate(`/dna/convene/events/${slug}`);
    }
  };

  const handleRSVP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slug) {
      navigate(`/dna/convene/events/${slug}`);
    }
  };

  if (isLoading) {
    return (
      <div 
        className="bg-card overflow-hidden rounded-xl border-2"
        style={{ borderColor: 'hsl(38 92% 50%)' }}
      >
        <Skeleton className="aspect-[2/1] w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg"
      style={{ borderColor: 'hsl(38 92% 50%)' }}
    >
      {/* Cover Image - Clickable */}
      <div 
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        {coverImage ? (
          <div className="aspect-[2/1] overflow-hidden relative">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[2/1] bg-gradient-to-br from-amber-500/60 via-amber-600 to-amber-700/80 flex items-center justify-center">
            <CalendarDays className="h-20 w-20 text-white/20" />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {/* Event Title - Primary Header */}
        <h3 
          className="font-bold text-xl sm:text-2xl leading-tight mb-3 line-clamp-2 text-foreground cursor-pointer hover:text-primary transition-colors"
          onClick={handleCardClick}
        >
          {title}
        </h3>

        {/* Date & Time - Calendar Box Style */}
        {startDate && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-12 h-12 border border-border rounded-lg overflow-hidden bg-background flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold text-primary uppercase leading-none">
                {monthAbbrev}
              </span>
              <span className="text-lg font-bold leading-none mt-0.5">
                {dayNumber}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{dayOfWeek}, {fullDate}</p>
              <p className="text-sm text-muted-foreground">{timeRange}</p>
            </div>
          </div>
        )}

        {/* Location */}
        {locationInfo && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 border border-border rounded-lg bg-background flex items-center justify-center">
              <locationInfo.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{locationInfo.primary}</p>
              {locationInfo.secondary && (
                <p className="text-sm text-muted-foreground truncate">{locationInfo.secondary}</p>
              )}
            </div>
          </div>
        )}

        {/* Expandable Description */}
        {description && (
          <div className="mb-4">
            <p className={cn(
              "text-sm text-muted-foreground leading-relaxed",
              !isExpanded && "line-clamp-2"
            )}>
              {isExpanded ? description : descriptionPreview}
              {!isExpanded && needsExpansion && '...'}
            </p>
          </div>
        )}

        {/* Learn More / Show Less Button */}
        {needsExpansion && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 mb-3 -ml-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Learn More
              </>
            )}
          </Button>
        )}

        {/* Host Info */}
        <div 
          className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dna/${item.author_username}`);
          }}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={organizerAvatar || ''} alt={organizerName || ''} />
            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
              {(organizerName || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{organizerName}</span>
          </span>
        </div>

        {/* Footer: Attendees + RSVP */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {attendeeCount > 0 ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {attendeeCount} going
                  {maxAttendees && ` · ${maxAttendees - attendeeCount} spots left`}
                </span>
              </div>
            ) : (
              <span className="text-sm text-primary font-medium">Be the first to register</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* RSVP Button */}
            <Button
              size="sm"
              onClick={handleRSVP}
              className="bg-primary hover:bg-primary/90"
            >
              RSVP
            </Button>

            {/* Three-dot Menu */}
            <div onClick={(e) => e.stopPropagation()}>
              {isOwnEvent ? (
                <PostMenuOwn
                  postId={item.post_id}
                  authorId={item.author_id}
                  currentUserId={currentUserId}
                  content={item.content || ''}
                  isPinned={!!item.pinned_at}
                  commentsDisabled={!!item.comments_disabled}
                  onUpdate={onUpdate}
                />
              ) : (
                <PostMenuOthers
                  postId={item.post_id}
                  authorId={item.author_id}
                  authorName={item.author_display_name || item.author_username || 'User'}
                  currentUserId={currentUserId}
                  onUpdate={onUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

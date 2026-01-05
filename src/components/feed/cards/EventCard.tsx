/**
 * Event Card for Universal Feed
 * 
 * Design System v2.0 Implementation:
 * - 2px Warm Amber full border (#F59E0B)
 * - Date badge overlay on cover image
 * - Subtitle, Agenda, Dress Code, Tags display
 * - RSVP CTA button
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { FeedCardBase } from './FeedCardBase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Video, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Shirt,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { linkifyContent } from '@/utils/linkifyContent';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { cn } from '@/lib/utils';

interface AgendaItem {
  time: string;
  title: string;
}

interface EventCardProps {
  item: UniversalFeedItem & {
    subtitle?: string;
    agenda?: AgendaItem[];
    dress_code?: string;
    tags?: string[];
    location_name?: string;
    location_city?: string;
    location_country?: string;
    meeting_url?: string;
    format?: 'in_person' | 'virtual' | 'hybrid';
    start_time?: string;
    end_time?: string;
    max_attendees?: number;
  };
  currentUserId: string;
  onUpdate: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();
  const [showFullContent, setShowFullContent] = useState(false);
  const [showFullAgenda, setShowFullAgenda] = useState(false);
  
  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { bookmarkCount, userHasBookmarked, toggleBookmark } = usePostBookmarks(item.post_id, currentUserId);

  // Parse event dates
  const startDate = item.start_time ? parseISO(item.start_time) : (item.created_at ? parseISO(item.created_at) : null);
  const endDate = item.end_time ? parseISO(item.end_time) : null;
  const monthShort = startDate ? format(startDate, 'MMM').toUpperCase() : 'TBD';
  const dayNumber = startDate ? format(startDate, 'd') : '--';

  // Format helpers
  const getFormatLabel = () => {
    switch (item.format) {
      case 'virtual': return 'Virtual';
      case 'hybrid': return 'Hybrid';
      default: return 'In Person';
    }
  };

  const getFormatIcon = () => {
    switch (item.format) {
      case 'virtual': return <Video className="h-3 w-3" />;
      case 'hybrid': return <><MapPin className="h-3 w-3" /><Video className="h-3 w-3" /></>;
      default: return <MapPin className="h-3 w-3" />;
    }
  };

  // Build location string
  const locationString = [item.location_name, item.location_city, item.location_country]
    .filter(Boolean)
    .join(', ');

  // Agenda display
  const agenda = item.agenda || [];
  const visibleAgenda = showFullAgenda ? agenda : agenda.slice(0, 3);
  const hasMoreAgenda = agenda.length > 3;

  // Content truncation
  const contentTruncated = item.content && item.content.length > 200;
  const displayContent = showFullContent ? item.content : item.content?.slice(0, 200);

  // Tags
  const tags = item.tags || [];

  return (
    <FeedCardBase bevelType="event">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar 
          className="h-10 w-10 cursor-pointer flex-shrink-0"
          onClick={() => navigate(`/dna/${item.author_username}`)}
        >
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span 
              className="font-semibold hover:underline cursor-pointer"
              onClick={() => navigate(`/dna/${item.author_username}`)}
            >
              {item.author_display_name || item.author_username}
            </span>
            <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-amber-200">
              <Calendar className="h-3 w-3" />
              Event
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs">
              {getFormatIcon()}
              {getFormatLabel()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Cover Image with Date Badge */}
      {item.media_url && (
        <div 
          className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 cursor-pointer"
          onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
        >
          <img 
            src={item.media_url} 
            alt={item.event_title || 'Event'} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {/* Date Badge Overlay */}
          <div className="absolute bottom-3 left-3 bg-white rounded-lg shadow-lg px-3 py-2 text-center min-w-[60px]">
            <p className="text-xs font-bold text-amber-600">{monthShort}</p>
            <p className="text-xl font-bold text-foreground leading-tight">{dayNumber}</p>
          </div>
        </div>
      )}

      {/* Event Title & Subtitle */}
      <div className="space-y-2 mb-4">
        <h3 
          className="text-xl font-bold cursor-pointer hover:text-amber-600 transition-colors"
          onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
        >
          {item.event_title || item.title || 'Upcoming Event'}
        </h3>
        {item.subtitle && (
          <p className="text-muted-foreground text-sm">{item.subtitle}</p>
        )}
      </div>

      {/* Event Details Box */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>
            {startDate ? format(startDate, 'MMM d, yyyy') : 'Date TBD'}
            {startDate && ` · ${format(startDate, 'h:mm a')}`}
            {endDate && ` - ${format(endDate, 'h:mm a')}`}
          </span>
        </div>

        {/* Location (for in-person/hybrid) */}
        {locationString && (item.format === 'in_person' || item.format === 'hybrid') && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>{locationString}</span>
          </div>
        )}

        {/* Meeting Link (for virtual/hybrid) */}
        {item.meeting_url && (item.format === 'virtual' || item.format === 'hybrid') && (
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <a 
              href={item.meeting_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Join Online <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Dress Code */}
        {item.dress_code && (
          <div className="flex items-center gap-2 text-sm">
            <Shirt className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>{item.dress_code}</span>
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>
            {item.view_count || 0} interested
            {item.max_attendees && ` · ${item.max_attendees} spots`}
          </span>
        </div>
      </div>

      {/* What to Expect */}
      {item.content && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">What to Expect</h4>
          <p className="text-muted-foreground text-sm">
            {linkifyContent(displayContent || '')}
            {contentTruncated && !showFullContent && '...'}
          </p>
          {contentTruncated && (
            <button 
              className="text-primary text-sm mt-1 hover:underline"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Agenda */}
      {agenda.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">Agenda</h4>
          <ul className="space-y-1.5">
            {visibleAgenda.map((agendaItem, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-amber-600 font-medium min-w-[60px]">{agendaItem.time}</span>
                <span>{agendaItem.title}</span>
              </li>
            ))}
          </ul>
          {hasMoreAgenda && (
            <button 
              className="text-primary text-sm mt-2 hover:underline flex items-center gap-1"
              onClick={() => setShowFullAgenda(!showFullAgenda)}
            >
              {showFullAgenda ? (
                <>Show less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>+{agenda.length - 3} more <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* RSVP CTA */}
      <Button 
        className="w-full bg-amber-500 hover:bg-amber-600 text-white mb-4"
        onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
      >
        💚 RSVP Now
      </Button>

      {/* Engagement Footer */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => toggleLike()}
        >
          <Heart className={cn('h-4 w-4', userHasLiked && 'fill-red-500 text-red-500')} />
          <span>{likeCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{item.comment_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>{item.share_count}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={() => toggleBookmark()}
        >
          <Bookmark className={cn('h-4 w-4', userHasBookmarked && 'fill-current text-primary')} />
        </Button>
      </div>
    </FeedCardBase>
  );
};

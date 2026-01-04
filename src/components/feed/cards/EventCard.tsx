/**
 * Event Card for Universal Feed
 * 
 * Design System v1.0 Implementation:
 * - 6px Warm Amber bevel (#F59E0B)
 * - Date badge overlay on cover image
 * - Event meta with icons
 * - RSVP CTA button
 */

import React from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { FeedCardBase } from './FeedCardBase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Video, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { linkifyContent } from '@/utils/linkifyContent';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { cn } from '@/lib/utils';

interface EventCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();
  
  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { bookmarkCount, userHasBookmarked, toggleBookmark } = usePostBookmarks(item.post_id, currentUserId);

  // Parse event date if available
  const eventDate = item.created_at ? parseISO(item.created_at) : null;
  const monthShort = eventDate ? format(eventDate, 'MMM').toUpperCase() : 'TBD';
  const dayNumber = eventDate ? format(eventDate, 'd') : '--';

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
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Cover Image with Date Badge */}
      {item.media_url && (
        <div 
          className="relative w-full h-48 rounded-lg overflow-hidden mb-4 cursor-pointer"
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

      {/* Event Title & Description */}
      <div className="space-y-3">
        <h3 
          className="text-xl font-bold cursor-pointer hover:text-amber-600 transition-colors"
          onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
        >
          {item.event_title || item.title || 'Upcoming Event'}
        </h3>
        
        {item.content && (
          <p className="text-muted-foreground line-clamp-2">
            {linkifyContent(item.content)}
          </p>
        )}

        {/* Event Meta Grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>{eventDate ? format(eventDate, 'h:mm a') : 'Time TBD'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-amber-500" />
            <span>{item.view_count || 0} interested</span>
          </div>
        </div>

        {/* RSVP CTA */}
        <Button 
          className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
        >
          RSVP Now
        </Button>
      </div>

      {/* Engagement Footer */}
      <div className="flex items-center gap-4 pt-4 mt-4 border-t">
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

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
import { PostMenuOwn } from '@/components/posts/PostMenuOwn';
import { PostMenuOthers } from '@/components/posts/PostMenuOthers';

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
  
  const isOwnEvent = item.author_id === currentUserId;
  
  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { bookmarkCount, userHasBookmarked, toggleBookmark } = usePostBookmarks(item.post_id, currentUserId);

  // Parse event dates
  const startDate = item.start_time ? parseISO(item.start_time) : (item.created_at ? parseISO(item.created_at) : null);
  const endDate = item.end_time ? parseISO(item.end_time) : null;
  const monthAbbrev = startDate ? format(startDate, 'MMM').toUpperCase() : 'TBD';
  const dayNumber = startDate ? format(startDate, 'd') : '--';
  const dayOfWeek = startDate ? format(startDate, 'EEEE') : '';
  const fullDate = startDate ? format(startDate, 'MMMM d, yyyy') : 'Date TBD';
  const timeRange = startDate 
    ? `${format(startDate, 'h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}`
    : '';

  // Location info
  const locationString = [item.location_name, item.location_city, item.location_country]
    .filter(Boolean)
    .join(', ');

  const getLocationInfo = () => {
    if (item.format === 'virtual') {
      return { icon: Video, text: 'Virtual Event', subtext: item.meeting_url ? 'Online' : null };
    }
    if (item.format === 'hybrid') {
      return { icon: Video, text: locationString || 'Hybrid Event', subtext: 'In-person & Online' };
    }
    return { icon: MapPin, text: locationString || 'Location TBD', subtext: null };
  };

  const locationInfo = getLocationInfo();
  const attendeeCount = item.view_count || 0;

  return (
    <div 
      className="bg-card hover:shadow-lg transition-all overflow-hidden cursor-pointer group rounded-2xl border border-border"
      onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
    >
      {/* Cover Image - Full width, 2:1 aspect ratio */}
      {item.media_url ? (
        <div className="aspect-[2/1] overflow-hidden relative">
          <img
            src={item.media_url}
            alt={item.event_title || 'Event'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-[2/1] bg-gradient-to-br from-primary/60 via-primary to-primary/80 flex items-center justify-center relative">
          <Calendar className="h-20 w-20 text-primary-foreground/20" />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Event Title - Large & Bold, Luma-style */}
        <h3 className="font-bold text-xl sm:text-2xl leading-tight mb-4 line-clamp-2 text-foreground">
          {item.event_title || item.title || 'Upcoming Event'}
        </h3>

        {/* Host info - Subtle, beneath title */}
        <div 
          className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dna/${item.author_username}`);
          }}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.author_avatar_url || ''} alt={item.author_display_name || ''} />
            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
              {(item.author_display_name || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {item.author_display_name || item.author_username}
          </span>
        </div>

        {/* Date & Time - Luma-style with calendar icon box */}
        {startDate && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg overflow-hidden bg-background flex flex-col items-center justify-center">
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

        {/* Location - Luma-style with icon */}
        {locationInfo && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-11 h-11 border border-border rounded-lg bg-background flex items-center justify-center">
              <locationInfo.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{locationInfo.text}</p>
              {locationInfo.subtext && (
                <p className="text-sm text-muted-foreground truncate">{locationInfo.subtext}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer: Attendees + Action Menu */}
        <div className="flex items-center justify-between pt-2">
          {attendeeCount > 0 ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendeeCount} going</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Be the first to register</span>
          )}

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
  );
};

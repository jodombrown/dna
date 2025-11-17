/**
 * Event Card for Universal Feed
 * 
 * Displays event announcements and updates in the feed.
 */

import React from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{item.author_display_name || item.author_username}</span>
            <span className="text-muted-foreground text-sm">created an event</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Event Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{item.event_title}</h3>
          {item.content && (
            <p className="text-muted-foreground">{item.content}</p>
          )}
        </div>

        {item.media_url && (
          <img 
            src={item.media_url} 
            alt={item.event_title || 'Event'} 
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        {/* Event Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Date TBD</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{item.view_count} interested</span>
          </div>
        </div>

        {/* CTA */}
        <Button 
          className="w-full"
          onClick={() => item.event_id && navigate(`/dna/convene/events/${item.event_id}`)}
        >
          View Event Details
        </Button>
      </div>

      {/* Engagement Footer */}
      <div className="flex items-center gap-4 pt-4 mt-4 border-t">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Heart className={`h-4 w-4 ${item.has_liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{item.like_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>{item.comment_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>{item.share_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto">
          <Bookmark className={`h-4 w-4 ${item.has_bookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </Card>
  );
};

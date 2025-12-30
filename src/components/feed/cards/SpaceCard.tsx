/**
 * Space Card for Universal Feed
 * 
 * Displays space/project announcements and updates in the feed.
 */

import React from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { linkifyContent } from '@/utils/linkifyContent';

interface SpaceCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
}

export const SpaceCard: React.FC<SpaceCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-4 sm:p-6 hover:border-primary/20 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{item.author_display_name || item.author_username}</span>
            <span className="text-muted-foreground text-sm">created a space</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Space Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{item.space_title}</h3>
          {item.content && (
            <p className="text-muted-foreground">{linkifyContent(item.content)}</p>
          )}
        </div>

        {item.media_url && (
          <img
            src={item.media_url}
            alt={item.space_title || 'Space'}
            className="w-full h-32 sm:h-48 object-cover rounded-lg"
          />
        )}

        {/* Space Meta */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{item.view_count} members</span>
        </div>

        {/* CTA */}
        <Button 
          className="w-full"
          onClick={() => item.space_id && navigate(`/dna/collaborate/spaces/${item.space_id}`)}
        >
          View Space
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

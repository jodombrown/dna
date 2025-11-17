/**
 * Story Card for Universal Feed
 * 
 * Displays stories, highlights, and featured content in the feed.
 */

import React from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Newspaper, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface StoryCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ item, currentUserId, onUpdate }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:border-primary/20 transition-colors bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{item.author_display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{item.author_display_name || item.author_username}</span>
            <span className="text-muted-foreground text-sm">published a story</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Story Content */}
      <div className="space-y-4">
        {item.media_url && (
          <img 
            src={item.media_url} 
            alt="Story" 
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <div className="flex items-start gap-3">
          <Newspaper className="h-6 w-6 text-dna-emerald flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold mb-2">Featured Story</h3>
            <p className="text-muted-foreground line-clamp-3">{item.content}</p>
          </div>
        </div>

        {/* CTA */}
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => navigate('/dna/convey')}
        >
          Read Full Story
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

/**
 * TrendingStoryCard
 *
 * Displays a trending story from the community feed
 * for the Zero State discovery experience.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TrendingStory } from '@/types/zero-state';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface TrendingStoryCardProps {
  story: TrendingStory;
}

export function TrendingStoryCard({ story }: TrendingStoryCardProps) {
  const timeAgo = story.created_at
    ? formatDistanceToNow(new Date(story.created_at), { addSuffix: true })
    : '';

  const initials = story.author_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <Link to={`/dna/convey/${story.id}`}>
      <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
        {/* Trending Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-dna-ochre/10 text-dna-ochre border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        </div>

        {/* Story Content */}
        <div className="flex gap-4">
          {/* Cover Image */}
          {story.cover_image && (
            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted">
              <img
                src={story.cover_image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`${TYPOGRAPHY.h5} text-foreground line-clamp-2 mb-2`}>
              {story.title || 'Untitled Story'}
            </h3>

            {/* Excerpt */}
            {story.excerpt && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {story.excerpt}
              </p>
            )}

            {/* Author and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={story.author_avatar || ''} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                  {story.author_name || 'Anonymous'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {story.engagement_count}
                </span>
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

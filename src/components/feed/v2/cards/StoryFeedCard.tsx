/**
 * DNA | FEED v2 - Story Card
 *
 * Renders stories with cover image, title, reading time, and series badge.
 */

import React from 'react';
import { FeedCardShell } from './FeedCardShell';
import { EngagementBar } from '../EngagementBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock } from 'lucide-react';
import type { FeedItem, StoryFeedContent } from '@/types/feedTypes';

interface StoryFeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentId: string) => void;
}

export const StoryFeedCard: React.FC<StoryFeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
}) => {
  const content = item.content as StoryFeedContent;

  return (
    <FeedCardShell
      contentType="story"
      primaryC={item.primaryC}
      author={item.createdBy}
      createdAt={item.createdAt}
      onClick={() => onNavigate?.(item.contentId)}
    >
      {/* Cover image */}
      {content.coverImageUrl && (
        <div className="mb-3 -mx-4 md:mx-0">
          <img
            src={content.coverImageUrl}
            alt={content.title}
            className="w-full h-48 md:h-56 object-cover md:rounded-lg"
            loading="lazy"
          />
        </div>
      )}

      {/* Series badge */}
      {content.seriesName && (
        <div className="mb-2">
          <Badge variant="outline" className="text-[10px] border-dna-ocean text-dna-ocean">
            {content.seriesName}
            {content.seriesPosition && ` · Part ${content.seriesPosition}`}
          </Badge>
        </div>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold leading-tight mb-1 line-clamp-2">
        {content.title}
      </h3>

      {/* Subtitle */}
      {content.subtitle && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
          {content.subtitle}
        </p>
      )}

      {/* Preview */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {content.bodyPreview}
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {content.readingTimeMinutes} min read
          </span>
        </div>
        <Button
          size="sm"
          variant="default"
          className="h-8 text-xs bg-[#2A7A8C] hover:bg-[#2A7A8C]/90"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.(item.contentId);
          }}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          Read
        </Button>
      </div>

      {/* Topics */}
      {content.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {content.topics.slice(0, 4).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-[10px]">
              {topic}
            </Badge>
          ))}
        </div>
      )}

      <EngagementBar
        contentType="story"
        engagement={item.engagement}
        feedItemId={item.id}
        onToggle={onEngagementToggle}
      />
    </FeedCardShell>
  );
};

/**
 * DNA | FEED v2 - Milestone Card
 *
 * Renders achievement milestones with celebration design,
 * metric display, and impact snapshot.
 */

import React from 'react';
import { FeedCardShell } from './FeedCardShell';
import { Button } from '@/components/ui/button';
import { Trophy, Share2 } from 'lucide-react';
import type { FeedItem, MilestoneFeedContent } from '@/types/feedTypes';

interface MilestoneFeedCardProps {
  item: FeedItem;
  onAction?: (action: MilestoneFeedContent['celebrationAction']) => void;
}

export const MilestoneFeedCard: React.FC<MilestoneFeedCardProps> = ({ item, onAction }) => {
  const content = item.content as MilestoneFeedContent;

  return (
    <FeedCardShell
      contentType="milestone"
      primaryC={item.primaryC}
      author={item.createdBy}
      createdAt={item.createdAt}
    >
      {/* Celebration header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-dna-gold/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-dna-gold" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-dna-gold">
          Milestone
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-base font-semibold leading-tight mb-2">{content.headline}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">{content.description}</p>

      {/* Metric display */}
      <div className="flex items-center justify-center py-4 mb-3 bg-dna-gold/5 rounded-lg">
        <div className="text-center">
          <span className="block text-3xl font-bold text-dna-gold">{content.metric.value}</span>
          <span className="block text-xs text-muted-foreground mt-1">
            {content.metric.label} {content.metric.unit}
          </span>
        </div>
      </div>

      {/* Impact snapshot */}
      {content.impactSnapshot && (
        <p className="text-xs text-muted-foreground italic text-center mb-3">
          {content.impactSnapshot}
        </p>
      )}

      {/* Celebration action */}
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs w-full border-dna-gold text-dna-gold hover:bg-dna-gold/10"
        onClick={() => onAction?.(content.celebrationAction)}
      >
        <Share2 className="w-3.5 h-3.5 mr-1" />
        {content.celebrationAction.label}
      </Button>
    </FeedCardShell>
  );
};

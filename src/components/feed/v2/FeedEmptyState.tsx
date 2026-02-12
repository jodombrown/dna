/**
 * DNA | FEED v2 - Empty State
 *
 * Culturally meaningful empty state messaging per feed type.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Briefcase, Heart, BookOpen, Compass } from 'lucide-react';
import { FeedType } from '@/types/feedTypes';
import { FEED_EMPTY_STATES } from '@/lib/feedConfig';

interface FeedEmptyStateProps {
  feedType: FeedType;
  onAction?: () => void;
}

const FEED_TYPE_ICONS: Record<FeedType, React.FC<{ className?: string }>> = {
  [FeedType.UNIVERSAL]: Compass,
  [FeedType.CONNECT]: Users,
  [FeedType.CONVENE]: Calendar,
  [FeedType.COLLABORATE]: Briefcase,
  [FeedType.CONTRIBUTE]: Heart,
  [FeedType.CONVEY]: BookOpen,
};

export const FeedEmptyState: React.FC<FeedEmptyStateProps> = ({ feedType, onAction }) => {
  const config = FEED_EMPTY_STATES[feedType];
  const Icon = FEED_TYPE_ICONS[feedType];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-dna-emerald/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-dna-emerald" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.headline}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
        {config.body}
      </p>
      <Button
        onClick={onAction}
        className="bg-dna-emerald hover:bg-dna-emerald/90"
      >
        {config.action}
      </Button>
    </div>
  );
};

/**
 * FeedCardBase - Universal wrapper for all feed cards
 * 
 * Applies consistent DNA Design System styling:
 * - 12px border radius
 * - 6px left bevel in mode-specific color
 * - Shadow with hover lift effect
 * - Consistent padding
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type FeedCardBevelType = 'post' | 'story' | 'event' | 'space' | 'opportunity' | 'need' | 'offer';

interface FeedCardBaseProps {
  bevelType: FeedCardBevelType;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const bevelColorMap: Record<FeedCardBevelType, string> = {
  post: 'border-l-dna-bevel-post',
  story: 'border-l-dna-bevel-story',
  event: 'border-l-dna-bevel-event',
  space: 'border-l-dna-bevel-space',
  opportunity: 'border-l-dna-bevel-opportunity',
  need: 'border-l-dna-bevel-opportunity', // Needs use same color as opportunities
  offer: 'border-l-dna-bevel-opportunity', // Offers use same color as opportunities
};

export const FeedCardBase: React.FC<FeedCardBaseProps> = ({
  bevelType,
  children,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        // Base card styling
        'bg-card rounded-xl border border-border/50',
        // 6px left bevel with mode-specific color
        'border-l-[6px]',
        bevelColorMap[bevelType],
        // Padding per design system
        'p-5',
        // Shadow system
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]',
        // Hover effects
        'transition-all duration-200',
        'hover:shadow-[0_2px_8px_rgba(0,0,0,0.10),0_8px_24px_rgba(0,0,0,0.08)]',
        'hover:-translate-y-0.5',
        // Clickable cursor if onClick provided
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

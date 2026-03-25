/**
 * FeedCardBase - Universal wrapper for all feed cards
 * 
 * Applies consistent DNA Design System styling:
 * - 12px border radius
 * - Full 2px border in mode-specific color
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

// Module-aligned bevel colors from Design System PRD
const bevelColors: Record<FeedCardBevelType, string> = {
  post: 'hsl(215 16% 47%)',          // Neutral slate
  story: 'hsl(191 53% 35%)',         // Convey Deep Teal
  event: 'hsl(39 65% 47%)',          // Convene Amber Gold
  space: 'hsl(147 33% 27%)',         // Collaborate Forest Green
  opportunity: 'hsl(25 51% 46%)',    // Contribute Copper
  need: 'hsl(25 51% 46%)',           // Contribute Copper
  offer: 'hsl(25 51% 46%)',          // Contribute Copper
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
      style={{ borderColor: bevelColors[bevelType] }}
      className={cn(
        // Base card styling
        'bg-card rounded-xl',
        // Full 2px border (color applied via inline style)
        'border-2',
        // Padding per design system
        'px-4 py-3 sm:p-5',
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

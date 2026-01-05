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

// Using inline styles for border colors to ensure they're applied correctly
// These match the CSS variables defined in index.css
const bevelColors: Record<FeedCardBevelType, string> = {
  post: 'hsl(215 16% 47%)',        // Slate #64748B
  story: 'hsl(173 84% 32%)',       // Deep Teal #0D9488
  event: 'hsl(38 92% 50%)',        // Warm Amber #F59E0B
  space: 'hsl(258 77% 60%)',       // Purple #8B5CF6
  opportunity: 'hsl(25 51% 46%)',  // Copper #B87333
  need: 'hsl(25 51% 46%)',         // Same as opportunity
  offer: 'hsl(25 51% 46%)',        // Same as opportunity
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

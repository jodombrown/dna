/**
 * DNA | CONVEY - Editorial Reactions Bar
 *
 * Five DNA-specific reactions displayed as labeled buttons.
 * Asante · Inspired · Let's Build · Powerful · Insightful
 *
 * No "like" or "heart" — DNA only.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type ConveyReactionType = 'asante' | 'inspired' | 'lets_build' | 'powerful' | 'insightful';

interface ConveyReactionConfig {
  type: ConveyReactionType;
  emoji: string;
  label: string;
}

const CONVEY_REACTIONS: ConveyReactionConfig[] = [
  { type: 'asante', emoji: '🤝', label: 'Asante' },
  { type: 'inspired', emoji: '✨', label: 'Inspired' },
  { type: 'lets_build', emoji: '🔨', label: "Let's Build" },
  { type: 'powerful', emoji: '💪', label: 'Powerful' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
];

interface ConveyReactionsBarProps {
  /** Currently selected reaction type, if any */
  selectedReaction?: ConveyReactionType | null;
  /** Counts keyed by reaction type */
  reactionCounts?: Partial<Record<ConveyReactionType, number>>;
  /** Called when a reaction is tapped */
  onReact: (type: ConveyReactionType) => void;
  className?: string;
}

export function ConveyReactionsBar({
  selectedReaction,
  reactionCounts = {},
  onReact,
  className,
}: ConveyReactionsBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto scrollbar-hide flex-nowrap',
        className
      )}
    >
      {CONVEY_REACTIONS.map((reaction) => {
        const isSelected = selectedReaction === reaction.type;
        const count = reactionCounts[reaction.type] || 0;

        return (
          <button
            key={reaction.type}
            onClick={(e) => {
              e.stopPropagation();
              onReact(reaction.type);
            }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors shrink-0',
              'hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected
                ? 'text-dna-forest font-medium bg-dna-forest/5'
                : 'text-muted-foreground'
            )}
          >
            <span className="text-sm">{reaction.emoji}</span>
            <span>{reaction.label}</span>
            {isSelected && count > 0 && (
              <span className="font-medium text-dna-forest">{count}</span>
            )}
            {!isSelected && count > 0 && (
              <span className="text-muted-foreground/60">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

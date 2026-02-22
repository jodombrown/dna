/**
 * DNA | Sprint 11 - Context Label
 *
 * Small text label below content type badge explaining WHY
 * the item scored high in the user's feed. Styled in DIA accent color.
 *
 * Examples:
 * - "Because you follow Agriculture & Agritech"
 * - "Popular in your network"
 * - "3 of your connections are attending"
 * - "Matches your skills: Project Management"
 * - "Trending in West Africa"
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FeedItem, FeedContentType, EventFeedContent, SpaceFeedContent, OpportunityFeedContent } from '@/types/feedTypes';
import type { FeedScoreResult } from '@/services/feed-scoring';

// ============================================================
// TYPES
// ============================================================

interface ContextLabelProps {
  item: FeedItem;
  scoreResult?: FeedScoreResult;
  userSectors?: string[];
  userSkills?: string[];
  className?: string;
}

interface ContextReason {
  text: string;
  tooltip: string;
  priority: number;
}

// ============================================================
// COMPONENT
// ============================================================

export const ContextLabel: React.FC<ContextLabelProps> = ({
  item,
  scoreResult,
  userSectors = [],
  userSkills = [],
  className,
}) => {
  const reason = generateContextReason(item, scoreResult, userSectors, userSkills);
  if (!reason) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1 text-xs',
            'text-amber-600 dark:text-amber-400',
            'cursor-default select-none',
            className
          )}
        >
          <Info className="h-3 w-3 flex-shrink-0 opacity-60" />
          <span className="truncate">{reason.text}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[260px] text-xs">
        {reason.tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

// ============================================================
// CONTEXT GENERATION
// ============================================================

function generateContextReason(
  item: FeedItem,
  scoreResult: FeedScoreResult | undefined,
  userSectors: string[],
  userSkills: string[]
): ContextReason | null {
  const reasons: ContextReason[] = [];

  // 1. Sector match
  if (userSectors.length > 0) {
    const matchingSectors = findMatchingSectors(item, userSectors);
    if (matchingSectors.length > 0) {
      reasons.push({
        text: `Because you follow ${matchingSectors[0]}`,
        tooltip: `This content is tagged with ${matchingSectors.join(', ')} which matches your sector interests.`,
        priority: 5,
      });
    }
  }

  // 2. Connection attendance (events)
  if (item.type === 'event') {
    const eventContent = item.content as EventFeedContent;
    const connectionCount = eventContent.attendees?.connectionCount || 0;
    if (connectionCount > 0) {
      reasons.push({
        text: `${connectionCount} of your connections are attending`,
        tooltip: `People in your network have RSVP'd to this event.`,
        priority: 8,
      });
    }
  }

  // 3. Connection members (spaces)
  if (item.type === 'space') {
    const spaceContent = item.content as SpaceFeedContent;
    if (spaceContent.connectionMemberCount > 0) {
      reasons.push({
        text: `${spaceContent.connectionMemberCount} connections are members`,
        tooltip: `People in your network are members of this space.`,
        priority: 7,
      });
    }
  }

  // 4. Skills match (opportunities)
  if (item.type === 'opportunity' && userSkills.length > 0) {
    const oppContent = item.content as OpportunityFeedContent;
    if (oppContent.matchReasons.length > 0) {
      reasons.push({
        text: `Matches your skills: ${oppContent.matchReasons[0]}`,
        tooltip: `This opportunity matches your listed skills and experience.`,
        priority: 6,
      });
    }
  }

  // 5. Network engagement (high engagement score)
  if (scoreResult && scoreResult.engagement > 0.6) {
    reasons.push({
      text: 'Popular in your network',
      tooltip: 'This content has high engagement from people in the DNA community.',
      priority: 4,
    });
  }

  // 6. Regional relevance
  if (scoreResult && scoreResult.connection > 0.7 && item.createdBy.connectionDegree <= 1) {
    reasons.push({
      text: `From ${item.createdBy.displayName} in your network`,
      tooltip: 'This person is in your direct network.',
      priority: 3,
    });
  }

  // 7. Strong connection
  if (item.createdBy.connectionDegree === 1) {
    reasons.push({
      text: `${item.createdBy.displayName} shared this`,
      tooltip: 'From one of your direct connections.',
      priority: 2,
    });
  }

  // Sort by priority descending and return top reason
  reasons.sort((a, b) => b.priority - a.priority);
  return reasons[0] || null;
}

function findMatchingSectors(item: FeedItem, userSectors: string[]): string[] {
  const lowerSectors = new Set(userSectors.map((s) => s.toLowerCase()));
  const itemTags = getItemTags(item);
  return itemTags.filter((tag) => lowerSectors.has(tag.toLowerCase()));
}

function getItemTags(item: FeedItem): string[] {
  switch (item.type) {
    case 'post': {
      const content = item.content as { hashtags?: string[] };
      return content.hashtags || [];
    }
    case 'story': {
      const content = item.content as { topics?: string[] };
      return content.topics || [];
    }
    case 'opportunity': {
      const content = item.content as OpportunityFeedContent;
      return [content.category, content.direction].filter(Boolean) as string[];
    }
    default:
      return [];
  }
}

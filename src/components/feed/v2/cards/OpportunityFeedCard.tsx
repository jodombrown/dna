/**
 * DNA | FEED v2 - Opportunity Card
 *
 * Renders opportunities with Need/Offer badge, category, compensation,
 * match score (Pro), and express interest CTA.
 */

import React from 'react';
import { FeedCardShell } from './FeedCardShell';
import { EngagementBar } from '../EngagementBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, Target, AlertCircle } from 'lucide-react';
import type { FeedItem, OpportunityFeedContent } from '@/types/feedTypes';

interface OpportunityFeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentId: string) => void;
  showMatchScore?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  skills_expertise: 'Skills & Expertise',
  funding_investment: 'Funding & Investment',
  mentorship_guidance: 'Mentorship',
  partnership_collaboration: 'Partnership',
  knowledge_training: 'Knowledge & Training',
  network_introductions: 'Network & Introductions',
  physical_resources: 'Resources',
  volunteer_time: 'Volunteer',
};

export const OpportunityFeedCard: React.FC<OpportunityFeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
  showMatchScore = false,
}) => {
  const content = item.content as OpportunityFeedContent;
  const isNeed = content.direction === 'need';

  return (
    <FeedCardShell
      contentType="opportunity"
      primaryC={item.primaryC}
      author={item.createdBy}
      createdAt={item.createdAt}
      onClick={() => onNavigate?.(item.contentId)}
    >
      {/* Direction and category badges */}
      <div className="flex items-center gap-2 mb-2">
        <Badge
          className={
            isNeed
              ? 'text-[10px] bg-[#B87333] hover:bg-[#B87333]/90'
              : 'text-[10px] bg-dna-emerald hover:bg-dna-emerald/90'
          }
        >
          {isNeed ? 'Need' : 'Offer'}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {CATEGORY_LABELS[content.category] || content.category}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold leading-tight line-clamp-2 mb-2">
        {content.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {content.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          {content.compensationDisplay}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {content.locationDisplay}
        </span>
        {content.durationDisplay && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {content.durationDisplay}
          </span>
        )}
      </div>

      {/* Deadline warning */}
      {content.daysUntilDeadline !== null && content.daysUntilDeadline <= 7 && content.daysUntilDeadline > 0 && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          {content.daysUntilDeadline} day{content.daysUntilDeadline !== 1 ? 's' : ''} remaining
        </div>
      )}

      {/* Match score (Pro feature) */}
      {showMatchScore && content.matchScore !== null && (
        <div className="mb-3 p-2.5 bg-dna-gold/5 rounded-lg border border-dna-gold/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-dna-gold" />
            <span className="text-sm font-semibold text-dna-gold">
              {Math.round(content.matchScore * 100)}% Match
            </span>
          </div>
          {content.matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {content.matchReasons.map((reason) => (
                <Badge key={reason} variant="secondary" className="text-[9px]">
                  {reason}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interest count */}
      {content.interestCount > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {content.interestCount} person{content.interestCount !== 1 ? 's' : ''} interested
        </p>
      )}

      {/* Express Interest CTA */}
      <div className="mb-3">
        <Button
          size="sm"
          className="h-9 text-xs w-full bg-[#B87333] hover:bg-[#B87333]/90"
          onClick={(e) => {
            e.stopPropagation();
            onEngagementToggle(item.id, 'interest');
          }}
        >
          {content.hasExpressedInterest ? 'Interest Expressed' : 'Express Interest'}
        </Button>
      </div>

      <EngagementBar
        contentType="opportunity"
        engagement={item.engagement}
        feedItemId={item.id}
        onToggle={onEngagementToggle}
      />
    </FeedCardShell>
  );
};

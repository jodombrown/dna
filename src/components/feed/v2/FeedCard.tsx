/**
 * DNA | FEED v2 - Polymorphic Feed Card
 *
 * Routes each FeedItem to the appropriate card component based on content type.
 * Single entry point for rendering any feed content in the v2 architecture.
 *
 * Sprint 11: Added MemberSpotlight card type and ContextLabel integration.
 */

import React from 'react';
import {
  PostFeedCard,
  StoryFeedCard,
  EventFeedCard,
  SpaceFeedCard,
  OpportunityFeedCard,
  DIAInsightCard,
  MilestoneFeedCard,
  ActivityFeedCard,
  MemberSpotlightFeedCard,
} from './cards';
import { ContextLabel } from '@/components/feed/ContextLabel';
import type { FeedItem, DIAInsightFeedContent, MilestoneFeedContent } from '@/types/feedTypes';
import type { FeedScoreResult } from '@/services/feed-scoring';

interface FeedCardProps {
  item: FeedItem;
  onEngagementToggle: (feedItemId: string, action: string) => void;
  onNavigate?: (contentType: string, contentId: string) => void;
  onDIAAction?: (action: DIAInsightFeedContent['actionCTA']) => void;
  onDIADismiss?: (feedItemId: string) => void;
  showMatchScores?: boolean;
  feedScore?: FeedScoreResult;
  userSectors?: string[];
  userSkills?: string[];
}

export const FeedCard: React.FC<FeedCardProps> = ({
  item,
  onEngagementToggle,
  onNavigate,
  onDIAAction,
  onDIADismiss,
  showMatchScores = false,
  feedScore,
  userSectors,
  userSkills,
}) => {
  if (!item || !item.id) return null;

  const handleNavigate = (contentId: string) => {
    onNavigate?.(item.type, contentId);
  };

  // Show context label on non-DIA cards when score data is available
  const showContextLabel =
    item.type !== 'dia_insight' &&
    item.type !== 'milestone' &&
    item.type !== 'activity' &&
    feedScore !== undefined;

  const contextLabel = showContextLabel ? (
    <ContextLabel
      item={item}
      scoreResult={feedScore}
      userSectors={userSectors}
      userSkills={userSkills}
      className="mb-2"
    />
  ) : null;

  const renderCard = () => {
    switch (item.type) {
      case 'post':
        return (
          <PostFeedCard
            item={item}
            onEngagementToggle={onEngagementToggle}
            onNavigate={handleNavigate}
          />
        );

      case 'story':
        return (
          <StoryFeedCard
            item={item}
            onEngagementToggle={onEngagementToggle}
            onNavigate={handleNavigate}
          />
        );

      case 'event':
        return (
          <EventFeedCard
            item={item}
            onEngagementToggle={onEngagementToggle}
            onNavigate={handleNavigate}
          />
        );

      case 'space':
        return (
          <SpaceFeedCard
            item={item}
            onEngagementToggle={onEngagementToggle}
            onNavigate={handleNavigate}
          />
        );

      case 'opportunity':
        return (
          <OpportunityFeedCard
            item={item}
            onEngagementToggle={onEngagementToggle}
            onNavigate={handleNavigate}
            showMatchScore={showMatchScores}
          />
        );

      case 'dia_insight':
        return (
          <DIAInsightCard
            item={item}
            onAction={onDIAAction}
            onDismiss={onDIADismiss}
          />
        );

      case 'milestone':
        return (
          <MilestoneFeedCard
            item={item}
            onAction={(action) => onDIAAction?.(action)}
          />
        );

      case 'activity':
        return (
          <ActivityFeedCard
            item={item}
            onNavigate={(targetType, targetId) => {
              if (targetType && targetId) {
                onNavigate?.(targetType, targetId);
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  // Wrap with context label
  if (contextLabel) {
    return (
      <div>
        {contextLabel}
        {renderCard()}
      </div>
    );
  }

  return renderCard();
};

/**
 * DNA | FEED v2 - Intelligence Stream Barrel Export
 *
 * Phase 2 feed architecture with DIA-powered ranking,
 * C-module diversity, and module-specific feeds.
 */

// Root container
export { FeedContainer } from './FeedContainer';

// Stream and card routing
export { FeedStream } from './FeedStream';
export { FeedCard } from './FeedCard';

// UI components
export { FeedHeader } from './FeedHeader';
export { FeedEmptyState } from './FeedEmptyState';
export { FeedLoadingState } from './FeedLoadingState';
export { EngagementBar } from './EngagementBar';

// Individual card components
export {
  FeedCardShell,
  PostFeedCard,
  StoryFeedCard,
  EventFeedCard,
  SpaceFeedCard,
  OpportunityFeedCard,
  DIAInsightCard,
  MilestoneFeedCard,
  ActivityFeedCard,
} from './cards';

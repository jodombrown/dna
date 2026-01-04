// src/components/hubs/shared/index.ts
// Barrel exports for shared hub components

export { AspirationMode } from './AspirationMode';
export type { AspirationModeProps } from './AspirationMode';
export { ComingSoonList } from './ComingSoonList';
export { NotifyMeModal } from './NotifyMeModal';
export { HostApplicationModal } from './HostApplicationModal';
export { HubModeSwitch } from './HubModeSwitch';
export {
  ConveneIllustration,
  CollaborateIllustration,
  ContributeIllustration,
  ConveyIllustration,
  ConnectIllustration
} from './HubIllustrations';
export { EarlyContentPreview } from './EarlyContentPreview';

// New Hub Components (PRD: Five C's Hub Pages)
export { HubHero } from './HubHero';
export type { HubType } from './HubHero';
export { HubStatsBar } from './HubStatsBar';
export type { HubStat } from './HubStatsBar';
export { HubQuickActions } from './HubQuickActions';
export type { QuickAction } from './HubQuickActions';
export { HubDIAPanel } from './HubDIAPanel';
export type { DIARecommendation } from './HubDIAPanel';
export { HubActivityFeed } from './HubActivityFeed';
export type { ActivityItem } from './HubActivityFeed';
export { HubSubNav } from './HubSubNav';
export type { SubNavTab } from './HubSubNav';

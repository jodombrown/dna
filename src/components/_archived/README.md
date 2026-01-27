# Archived Components

These components have been archived because they are no longer imported or used anywhere in the active codebase.

**Archived on:** January 27, 2026  
**Reason:** Phase 3 codebase cleanup - zero imports found

## Contents

### /connect (12 files)
Legacy Connect module components replaced during ADA (Adaptive Dashboard Architecture) migration:
- ConnectSearchFilters.tsx
- ConnectErrorState.tsx
- ConnectPageHeader.tsx
- DiscoverFilters.tsx
- EventDetailDialog.tsx
- ConnectButton.tsx
- ConnectHeader.tsx
- ConnectHero.tsx
- ConnectLoadingState.tsx
- ConnectStats.tsx
- NetworkingTabs.tsx
- SmartRecommendations.tsx

### /connect/tabs (5 files)
Supporting tab components for the legacy NetworkingTabs:
- ProfessionalsTab.tsx
- ProfessionalsFilters.tsx
- ProfessionalListItem.tsx
- CommunitiesTab.tsx
- OrganizationsTab.tsx
- EventsTab.tsx

### /dashboard (13 files)
Legacy Dashboard components replaced during ADA migration. The new dashboard uses the Adaptive Dashboard Architecture with view states:
- DNADashboard.tsx
- DashboardNudges.tsx
- FeedQuickAccess.tsx
- MyDNAHub.tsx
- NetworkFeedWidget.tsx
- PlatformLayers.tsx
- ProfileCompletenessWidget.tsx
- ProgressStrip.tsx
- RecentPostsWidget.tsx
- RevenueStreams.tsx
- TargetMetrics.tsx
- UserDashboardLayout.tsx
- UserJourney.tsx

## Recovery
If you need to restore any component, simply move it back to its original location and add the necessary imports.

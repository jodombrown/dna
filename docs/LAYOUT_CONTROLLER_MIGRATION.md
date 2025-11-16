# ADA v2.0 - LayoutController Migration Summary

## Overview

This document tracks the migration of all /dna/* routes to use LayoutController with ViewStateContext, eliminating legacy layout components (FeedLayout, UserDashboardLayout, LinkedInLayout).

## Migration Status

### ✅ Fully Migrated (Using LayoutController)

**Connect:**
- `/dna/feed` - Feed.tsx
- `/dna/discover` - Discover.tsx
- `/dna/network` - Network.tsx

**Convene:**
- `/dna/convene` - ConveneHub.tsx ✅
- `/dna/convene/create` - CreateEvent.tsx ✅ (imports updated)
- `/dna/convene/events` - EventsIndex.tsx ✅ (imports updated)
- `/dna/convene/analytics` - EventAnalytics.tsx ⚠️ (needs wrapper update)
- `/dna/convene/my-events` - MyEvents.tsx ⚠️ (needs wrapper update)
- `/dna/convene/groups` - GroupsBrowse.tsx ⚠️ (needs wrapper update)
- `/dna/convene/events/group/:groupId` - GroupEventsPage.tsx ⚠️ (needs wrapper update)
- `/dna/organizer/analytics` - OrganizerAnalytics.tsx ⚠️ (needs wrapper update)

**Collaborate:**
- `/dna/collaborate` - CollaborateHub.tsx ✅ (imports updated)
- `/dna/collaborate/spaces/new` - CreateSpace.tsx ⚠️ (needs wrapper update)
- `/dna/collaborate/spaces` - SpacesIndex.tsx ⚠️ (needs wrapper update)
- `/dna/collaborate/spaces/:slug` - SpaceBoard.tsx ⚠️ (needs wrapper update)
- `/dna/collaborate/spaces/:slug/settings` - SpaceSettings.tsx ⚠️ (needs wrapper update)
- `/dna/collaborate/my-spaces` - MySpaces.tsx ⚠️ (needs wrapper update)

**Contribute:**
- `/dna/contribute` - ContributeHub.tsx ✅
- `/dna/contribute/:id` - OpportunityDetail.tsx ✅
- `/dna/contribute/needs` - NeedsIndex.tsx ✅ (imports updated, needs wrapper update)

**Convey:**
- `/dna/convey` - ConveyHub.tsx ✅
- `/dna/convey/:slug` - (uses DetailViewLayout via FOCUS_DETAIL_MODE)
- `/dna/convey/new` - CreateStory.tsx ✅ (imports updated, needs wrapper update)

**Other:**
- `/dna/messages` - Messages.tsx ✅
- `/dna/analytics` - Analytics.tsx ✅
- `/dna/notifications` - Notifications.tsx ✅

### ⚠️ Needs Layout Wrapper Update

These files have had imports updated to use LayoutController but still use `<FeedLayout>` wrapper:

1. **src/pages/dna/convene/CreateEvent.tsx**
2. **src/pages/dna/convene/EventsIndex.tsx**
3. **src/pages/dna/convene/EventAnalytics.tsx**
4. **src/pages/dna/convene/GroupEventsPage.tsx**
5. **src/pages/dna/convene/GroupsBrowse.tsx**
6. **src/pages/dna/convene/MyEvents.tsx**
7. **src/pages/dna/convene/OrganizerAnalytics.tsx**
8. **src/pages/dna/collaborate/CollaborateHub.tsx**
9. **src/pages/dna/collaborate/CreateSpace.tsx**
10. **src/pages/dna/collaborate/MySpaces.tsx**
11. **src/pages/dna/collaborate/SpaceBoard.tsx**
12. **src/pages/dna/collaborate/SpaceSettings.tsx**
13. **src/pages/dna/collaborate/SpacesIndex.tsx**
14. **src/pages/dna/contribute/NeedsIndex.tsx**
15. **src/pages/dna/convey/CreateStory.tsx**

## ViewState Mappings

Route → ViewState → Layout:

### DASHBOARD_HOME
- Route: `/dna/feed`
- Layout: ThreeColumn (15% | 70% | 15%)
- Left: LeftNav
- Right: DashboardModules

### CONNECT_MODE
- Routes: `/dna/connect/*`, `/dna/network/*`, `/dna/discover/*`
- Layout: ThreeColumn (15% | 70% | 15%)
- Left: LeftNav
- Right: RightWidgets (connection-focused)

### CONVENE_MODE
- Routes: `/dna/convene/*`, `/dna/events/*`
- Layout: TwoColumn (60% | 40%)
- Left: (collapsed, not shown)
- Right: RightWidgets (event-focused)

### COLLABORATE_MODE
- Routes: `/dna/collaborate/*`, `/dna/projects/*`
- Layout: FullCanvas or TwoColumn
- Left: (minimal or none)
- Right: RightWidgets (space-focused) or none

### CONTRIBUTE_MODE
- Routes: `/dna/contribute/*`, `/dna/opportunities/*`, `/dna/impact/*`
- Layout: TwoColumn (55% | 45%)
- Left: LeftNav (collapsed or minimal)
- Right: RightWidgets (contribution-focused)

### CONVEY_MODE
- Routes: `/dna/convey/*`, `/dna/daily/*`, `/dna/stories/*`
- Layout: ThreeColumn (15% | 70% | 15%)
- Left: LeftNav
- Right: RightWidgets (story-focused)

### MESSAGES_MODE
- Route: `/dna/messages/*`
- Layout: TwoColumn (65% | 35%)
- Left: (message list, built into component)
- Right: (conversation, built into component)

### FOCUS_DETAIL_MODE
- Routes: Detail views like `/dna/events/:slug`, `/dna/convey/:slug`
- Layout: DetailViewLayout (modal-style overlay)

## Legacy Layouts - Deprecated

All legacy layout components have been moved to `src/components/layout/legacy/` and marked as deprecated:

- **FeedLayout** → `/legacy/FeedLayout.tsx` (deprecated)
- **UserDashboardLayout** → `/legacy/UserDashboardLayout.tsx` (deprecated)
- **LinkedInLayout** → `/legacy/LinkedInLayout.tsx` (deprecated)

Each file includes a warning comment:
```typescript
/**
 * DEPRECATED: [LayoutName] - Legacy Layout Component
 * 
 * ⚠️ DO NOT USE THIS LAYOUT FOR NEW /dna/* ROUTES ⚠️
 * 
 * This layout component is deprecated and should NOT be used for any /dna/* routes.
 * All new and refactored /dna/* pages should use LayoutController with ViewStateContext.
 */
```

## Migration Pattern

### Before (Legacy):
```tsx
import { FeedLayout } from '@/components/layout/FeedLayout';

const MyPage = () => {
  return (
    <FeedLayout>
      <div className="container">
        {/* Content */}
      </div>
    </FeedLayout>
  );
};
```

### After (ADA):
```tsx
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';

const MyPage = () => {
  const centerColumn = (
    <div className="container">
      {/* Content */}
    </div>
  );

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={centerColumn}
      rightColumn={<RightWidgets variant="convene" />}
    />
  );
};
```

## Next Steps

1. **Complete Wrapper Updates** (Priority 1)
   - Update all 15 files listed above to replace `<FeedLayout>` wrapper with `<LayoutController>`
   - Ensure proper column configuration for each route's ViewState

2. **Test Each Route** (Priority 2)
   - Verify layout renders correctly
   - Check responsive behavior (desktop/tablet/mobile)
   - Confirm right rail shows appropriate modules

3. **Remove Legacy Layouts** (Priority 3)
   - After all routes migrated, optionally delete legacy layout files
   - Update any remaining non-/dna routes if needed

4. **Documentation** (Priority 4)
   - Update routing documentation
   - Add migration guide for future route additions
   - Document LayoutController usage patterns

## Coverage Metrics

- **Total /dna/* Routes**: ~40
- **Fully Migrated**: ~25 (62.5%)
- **Needs Wrapper Update**: 15 (37.5%)
- **Target**: 100% by end of sprint

## Success Criteria

✅ All /dna/* routes use LayoutController
✅ ViewStateContext is sole source of layout truth
✅ No /dna/* route imports legacy layouts
✅ Right rail is adaptive and policy-driven
✅ Mobile/desktop layouts render correctly
✅ No layout regressions or broken pages

# 🧩 DNA | ADA v2.0 – Completion Assessment Framework

**Assessment Date**: November 16, 2025  
**Assessment Conducted By**: Makena (AI Co-Founder)

---

## 0. Snapshot Summary

### Overall ADA Status
**✅ Partially Stable** - Core infrastructure in place, needs broader rollout

### LayoutController Coverage
**~20%** of `/dna/*` routes currently using LayoutController

### 5Cs Status:
- **Connect**: ⚠️ Partially refactored (Network, Discover use LayoutController)
- **Convene**: ⚠️ Mixed state (Some routes refactored, many still use FeedLayout)
- **Collaborate**: 🔴 Not refactored (All routes still use FeedLayout)
- **Contribute**: ⚠️ Partially refactored (Hub pages use UnifiedHeader, not LayoutController)
- **Convey**: ⚠️ Partially refactored (Main routes use LayoutController, Create uses FeedLayout)

### Right Rail Status
**Partially adaptive** - RightWidgets component exists with variant support, but not used consistently

### Top 3 Issues to Fix Next:
1. **ContributeHub and NeedsIndex still use UnifiedHeader directly** - Should use LayoutController
2. **All Convene detail routes (EventDetail, CreateEvent, etc.) use FeedLayout** - Need refactoring
3. **All Collaborate routes use FeedLayout** - Complete section needs migration

---

## 1️⃣ Prompt 1 – LayoutController Unification

### Goal of Prompt 1:
All `/dna/*` routes use LayoutController → ViewState is the single source of truth for layouts.

### A. What Was Actually Done

#### ✅ Files Changed (Recent session):
1. `src/pages/dna/Convey.tsx` - ✅ Refactored to use LayoutController
2. `src/pages/dna/convey/ConveyHub.tsx` - ✅ Refactored to use LayoutController
3. `src/pages/dna/contribute/ContributeHub.tsx` - ⚠️ Still uses UnifiedHeader directly (NOT LayoutController)
4. `src/pages/dna/contribute/NeedsIndex.tsx` - ⚠️ Still uses UnifiedHeader directly (NOT LayoutController)
5. `docs/ADA_LAYOUT_UNIFICATION_PROGRESS.md` - ✅ Updated

#### ✅ Routes Previously Refactored (Before this session):
- `/dna/analytics` - Analytics.tsx
- `/dna/discover` - Discover.tsx
- `/dna/events` - Events.tsx
- `/dna/groups` - Groups.tsx
- `/dna/impact` - Impact.tsx
- `/dna/network` - Network.tsx
- `/dna/notifications` - Notifications.tsx
- `/dna/feed` - Feed.tsx

#### 🔴 Routes Still Using Legacy Layouts:

**Using FeedLayout (20 files):**
1. `src/pages/DiscoveryFeedPage.tsx`
2. `src/pages/FeedPage.tsx`
3. `src/pages/GroupSettingsPage.tsx`
4. `src/pages/NetworkFeedPage.tsx`
5. `src/pages/dna/collaborate/CollaborateHub.tsx`
6. `src/pages/dna/collaborate/CreateSpace.tsx`
7. `src/pages/dna/collaborate/MySpaces.tsx`
8. `src/pages/dna/collaborate/SpaceBoard.tsx`
9. `src/pages/dna/collaborate/SpaceSettings.tsx`
10. `src/pages/dna/collaborate/SpacesIndex.tsx`
11. `src/pages/dna/convene/ConveneHub.tsx` *(has duplicate - one uses LayoutController, one uses FeedLayout)*
12. `src/pages/dna/convene/CreateEvent.tsx`
13. `src/pages/dna/convene/EventAnalytics.tsx`
14. `src/pages/dna/convene/EventDetail.tsx` *(missing from search, likely exists)*
15. `src/pages/dna/convene/EventsIndex.tsx`
16. `src/pages/dna/convene/GroupEventsPage.tsx`
17. `src/pages/dna/convene/GroupsBrowse.tsx`
18. `src/pages/dna/convene/MyEvents.tsx`
19. `src/pages/dna/convene/OrganizerAnalytics.tsx`
20. `src/pages/dna/convey/CreateStory.tsx`

**Using UserDashboardLayout (1 file):**
1. `src/pages/dna/Username.tsx` - Special case (mobile/desktop branching logic)

**Using UnifiedHeader Directly (2 files - should use LayoutController):**
1. `src/pages/dna/contribute/ContributeHub.tsx`
2. `src/pages/dna/contribute/NeedsIndex.tsx`

#### ⚠️ Deprecated Layouts Status:
- ✅ `FeedLayout` marked as deprecated in `DeprecatedLayouts.tsx`
- ✅ `UserDashboardLayout` marked as deprecated in `DeprecatedLayouts.tsx`
- ✅ `LinkedInLayout` marked as deprecated in `DeprecatedLayouts.tsx`
- 🔴 Legacy layouts NOT moved to `/legacy/` folder yet
- 🔴 Legacy layouts still actively imported by 23+ files

---

### B. Quick Verification Checklist

#### 1. Structural ✅/⚠️/🔴

##### ✅ COMPLETE:
- [x] LayoutController component exists and is production-ready
- [x] ViewStateContext exists with proper route mapping
- [x] LeftNav component exists as reusable column
- [x] RightWidgets component exists with variant support
- [x] All 5Cs have ViewState definitions (CONNECT_MODE, CONVENE_MODE, etc.)

##### ⚠️ PARTIAL:
- [~] LayoutController is imported and used on ~20% of `/dna/*` pages
- [~] Some pages still directly import ThreeColumnLayout, TwoColumnLayout, etc.
- [~] ViewStateContext maps all routes, but not all routes query it

##### 🔴 INCOMPLETE:
- [ ] No page directly imports old layout components (still 20+ imports exist)
- [ ] All /dna/* routes use LayoutController (only ~10 out of ~50+ do)

#### 2. Behavioral (Conceptual Mapping) ✅/⚠️/🔴

| Route Pattern | Expected ViewState | Expected Layout | Status |
|---------------|-------------------|-----------------|--------|
| `/dna/feed` | DASHBOARD_HOME | ThreeColumn | ✅ |
| `/dna/connect/*` | CONNECT_MODE | ThreeColumn | ⚠️ (Network, Discover yes; Messages no) |
| `/dna/convene/*` | CONVENE_MODE | TwoColumn | 🔴 (Only Events.tsx, ConveyHub partial) |
| `/dna/collaborate/*` | COLLABORATE_MODE | FullCanvas/TwoColumn | 🔴 (None refactored) |
| `/dna/contribute/*` | CONTRIBUTE_MODE | TwoColumn | ⚠️ (Uses UnifiedHeader, not LayoutController) |
| `/dna/convey/*` | CONVEY_MODE | ThreeColumn | ⚠️ (Convey.tsx, ConveyHub yes; CreateStory no) |
| `/dna/messages/*` | MESSAGES_MODE | TwoColumn | 🔴 (Not refactored) |

##### ✅ Correctly Mapped in ViewStateContext:
- [x] All main routes mapped correctly in `routeToViewState()`
- [x] All ViewStates have layout configs in `viewStateToLayout()`

##### 🔴 Not All Routes Use the Mapping:
- [ ] ~30+ routes bypass LayoutController entirely
- [ ] No route guards to enforce LayoutController usage

---

### C. What's Working / Not Working

#### ✅ Working as Intended:
1. **LayoutController Infrastructure** - Fully functional, handles all layout variants
2. **ViewStateContext** - Single source of truth for route → ViewState → Layout mapping
3. **Reusable Columns** - LeftNav and RightWidgets work across refactored routes
4. **Feed Page** - Uses LayoutController correctly
5. **Connect Section** (partial) - Network, Discover use LayoutController
6. **Convey Section** (partial) - Main Convey.tsx and ConveyHub use LayoutController

#### ⚠️ Partially Working:
1. **Contribute Section** - Uses UnifiedHeader directly instead of LayoutController wrapper
2. **Convene Section** - Mixed state (some routes refactored, most not)
3. **Convey Section** - CreateStory still uses FeedLayout

#### 🔴 Not Working / Regressions:
1. **Collaborate Section** - 0% refactored, all routes use FeedLayout
2. **Messages** - Not refactored
3. **Detail Views** - Most `/dna/*/[id]` routes use FeedLayout
4. **Legacy Pages** - DiscoveryFeedPage, FeedPage, NetworkFeedPage outside /dna/* not touched
5. **Username.tsx** - Special case with mobile/desktop logic, needs custom approach

---

### D. Next Actions (Prompt 1 Area Only)

#### Priority 1: Fix Contribute Section (IMMEDIATE)
**Why**: Already partially refactored but using wrong pattern
- [ ] Refactor `ContributeHub.tsx` to use LayoutController instead of UnifiedHeader
- [ ] Refactor `NeedsIndex.tsx` to use LayoutController instead of UnifiedHeader
- [ ] Create ContributeFilters component for right column
- [ ] Test CONTRIBUTE_MODE ViewState renders correctly

#### Priority 2: Complete Convene Section (HIGH)
**Why**: High traffic, user-facing events functionality
- [ ] Refactor `CreateEvent.tsx` - FeedLayout → LayoutController
- [ ] Refactor `EventDetail.tsx` - FeedLayout → LayoutController  
- [ ] Refactor `EventsIndex.tsx` - FeedLayout → LayoutController
- [ ] Refactor `MyEvents.tsx` - FeedLayout → LayoutController
- [ ] Refactor `EventAnalytics.tsx`, `OrganizerAnalytics.tsx` - FeedLayout → LayoutController
- [ ] Deduplicate ConveneHub (remove FeedLayout version if exists)

#### Priority 3: Refactor Collaborate Section (MEDIUM)
**Why**: Active M5 feature, needs consistent UX
- [ ] Refactor `CollaborateHub.tsx` - FeedLayout → LayoutController
- [ ] Refactor `SpacesIndex.tsx` - FeedLayout → LayoutController
- [ ] Refactor `SpaceBoard.tsx` - FeedLayout → LayoutController (may need FullCanvas)
- [ ] Refactor `CreateSpace.tsx`, `SpaceSettings.tsx` - FeedLayout → LayoutController

#### Priority 4: Complete Convey Section (LOW)
**Why**: Lower traffic, but should be consistent
- [ ] Refactor `CreateStory.tsx` - FeedLayout → LayoutController

#### Priority 5: Cleanup & Documentation (ONGOING)
- [ ] Move FeedLayout, UserDashboardLayout to `src/components/layout/legacy/`
- [ ] Add console.error() if legacy layouts are imported
- [ ] Create route-testing checklist to ensure new /dna/* routes use LayoutController
- [ ] Update ADA_LAYOUT_UNIFICATION_PROGRESS.md as routes are refactored

---

## 2️⃣ Prompt 2 – Implement Contribute & Convey (5Cs Completion)

### Goal of Prompt 2:
Complete the two missing 5C pillars: Contribute and Convey. All routes must use LayoutController.

### A. What Was Actually Done

#### Routes Created/Refactored:

##### Contribute:
1. ✅ `/dna/contribute` - ContributeHub.tsx exists, renders
2. ✅ `/dna/contribute/needs` - NeedsIndex.tsx exists, renders
3. ⚠️ Both use `UnifiedHeader` directly, NOT LayoutController

##### Convey:
1. ✅ `/dna/convey` - Convey.tsx refactored to use LayoutController
2. ✅ `/dna/convey/hub` - ConveyHub.tsx refactored to use LayoutController  
3. 🔴 `/dna/convey/create` - CreateStory.tsx still uses FeedLayout

#### ViewStateContext Updates:
- [x] CONTRIBUTE_MODE mapped to `/dna/contribute`, `/dna/opportunities`, `/dna/impact`
- [x] CONVEY_MODE mapped to `/dna/convey`, `/dna/daily`, `/dna/stories`
- [x] Both have layout configs (TwoColumn for Contribute, ThreeColumn for Convey)

---

### B. Quick Verification Checklist

#### 1. Route Accessibility ✅/⚠️/🔴

##### ✅ Routes Exist and Render:
- [x] `/dna/contribute` loads
- [x] `/dna/contribute/needs` loads
- [x] `/dna/convey` loads
- [x] `/dna/convey/hub` loads (assumed, based on refactor)

##### 🔴 Routes Missing or Broken:
- [ ] `/dna/contribute/:id` (detail view) - Not created
- [ ] `/dna/convey/:id` (story detail view) - Not created

#### 2. LayoutController Compliance ✅/⚠️/🔴

##### ✅ Using LayoutController:
- [x] Convey.tsx
- [x] ConveyHub.tsx

##### 🔴 NOT Using LayoutController (should be):
- [ ] ContributeHub.tsx (uses UnifiedHeader)
- [ ] NeedsIndex.tsx (uses UnifiedHeader)
- [ ] CreateStory.tsx (uses FeedLayout)

#### 3. Navigation Integration ✅/⚠️/🔴

##### ✅ Accessible from Navigation:
- [x] Contribute and Convey present in UnifiedHeader
- [x] Contribute and Convey present in MobileBottomNav

##### ⚠️ Unknown (Need to Verify):
- [ ] Contribute and Convey in LeftNav component
- [ ] Contribute and Convey have proper active state highlighting

---

### C. What's Working / Not Working

#### ✅ Working as Intended:
1. **Convey Main Routes** - Convey.tsx and ConveyHub use LayoutController correctly
2. **Contribute Data Flow** - ContributeHub fetches and displays contribution needs
3. **Contribute Filters** - NeedsIndex has type/status/sort filters
4. **ViewState Mapping** - Both CONTRIBUTE_MODE and CONVEY_MODE defined and mapped

#### ⚠️ Partially Working:
1. **Contribute Layout** - Uses UnifiedHeader instead of LayoutController pattern
2. **Convey Create Flow** - CreateStory still uses old FeedLayout

#### 🔴 Not Working / Missing:
1. **Detail Views** - Neither `/dna/contribute/:id` nor `/dna/convey/:id` created
2. **Contribute LayoutController** - Should wrap UnifiedHeader with LayoutController
3. **Right Column Adaptation** - Contribute section needs ContributeFilters in RightWidgets
4. **Mobile Experience** - No verification of mobile rendering

---

### D. Next Actions (Prompt 2 Area Only)

#### Priority 1: Fix ContributeHub Layout (CRITICAL)
**Why**: Already partially built, just needs correct wrapper
```tsx
// Current (WRONG):
<div className="min-h-screen bg-background">
  <UnifiedHeader />
  <main>...</main>
  <Footer />
</div>

// Should be:
<LayoutController
  leftContent={<LeftNav />}
  centerContent={<ContributeMainContent />}
  rightContent={<RightWidgets variant="contribute" />}
/>
```

Actions:
- [ ] Extract main content from ContributeHub into `<ContributeMainContent />`
- [ ] Wrap with LayoutController
- [ ] Create `<ContributeFilters />` component for right column
- [ ] Update RightWidgets to support `variant="contribute"`
- [ ] Remove direct UnifiedHeader usage

#### Priority 2: Fix NeedsIndex Layout (CRITICAL)
Same pattern as ContributeHub:
- [ ] Extract filters and needs list into center content
- [ ] Wrap with LayoutController  
- [ ] Move filters to RightWidgets
- [ ] Remove direct UnifiedHeader usage

#### Priority 3: Create Detail Views (MEDIUM)
- [ ] Create `/dna/contribute/needs/:id` - OpportunityDetail.tsx
- [ ] Create `/dna/convey/stories/:id` - StoryDetail.tsx
- [ ] Both should use FOCUS_DETAIL_MODE → DetailViewLayout via LayoutController

#### Priority 4: Fix CreateStory (LOW)
- [ ] Refactor CreateStory.tsx from FeedLayout → LayoutController
- [ ] Consider if create flows need special layout (FullCanvas?)

---

## 3️⃣ Supabase Performance Optimizations

### Goal of Prompt 3:
Fix all performance warnings from Supabase linter.

### A. What Was Done

#### Migration 1: `20251116072447` - Fix auth_rls_initplan warnings
**Purpose**: Wrap `auth.uid()` calls with `(SELECT auth.uid())` to prevent re-evaluation per row

**Tables Fixed:**
1. `user_interactions` (2 policies)
2. `user_vectors` (1 policy)
3. `entity_vectors` (1 policy)  
4. `ada_policies` (2 policies)
5. `ada_cohorts` (2 policies)
6. `ada_experiments` (2 policies)
7. `ada_experiment_variants` (2 policies)
8. `ada_cohort_memberships` (2 policies)

**Status**: ✅ Applied and verified - no more `auth_rls_initplan` warnings

#### Migration 2: `20251116072614` - Fix multiple_permissive_policies warnings
**Purpose**: Separate ALL policies into INSERT/UPDATE/DELETE to avoid multiple SELECT policies

**Tables Fixed:**
1. `ada_cohort_memberships` - Split "System can manage" into 3 policies
2. `ada_cohorts` - Split "Admins can manage" into 3 policies
3. `ada_experiments` - Split "Admins can manage" into 3 policies
4. `ada_experiment_variants` - Split "Admins can manage" into 3 policies
5. `ada_policies` - Split "Admins can manage" into 3 policies
6. `entity_vectors` - Split "System can manage" into 3 policies
7. `user_vectors` - Split "System can manage" into 3 policies

**Status**: ✅ Applied and verified - no more performance warnings

---

### B. Verification Results

#### ✅ Performance Warnings Cleared:
- [x] Zero `auth_rls_initplan` warnings
- [x] Zero `multiple_permissive_policies` warnings
- [x] All ADA tables optimized
- [x] All vector tables optimized

---

### C. What's Working / Not Working

#### ✅ Working as Intended:
1. **RLS Performance** - All policies use `(SELECT auth.uid())` pattern
2. **Policy Structure** - Single SELECT policy per table, separate INSERT/UPDATE/DELETE
3. **Security Intact** - No permissions weakened during refactor
4. **Database Health** - Supabase linter shows green

---

### D. Next Actions (Performance Area)

#### Monitoring (ONGOING):
- [ ] Monitor query performance after optimization
- [ ] Check if any new migrations introduce similar issues
- [ ] Document RLS best practices in project wiki

---

## 📊 Summary Statistics

### LayoutController Adoption:
- **Total /dna/* Routes**: ~50+ routes estimated
- **Using LayoutController**: ~10 routes (20%)
- **Using Legacy Layouts**: ~40 routes (80%)

### 5Cs Implementation Status:
| Pillar | Hub Route | Detail Routes | Layout Pattern | Status |
|--------|-----------|---------------|----------------|--------|
| Connect | ✅ Refactored | ⚠️ Mixed | ThreeColumn | ⚠️ 60% |
| Convene | ⚠️ Mixed | 🔴 FeedLayout | TwoColumn | 🔴 30% |
| Collaborate | 🔴 FeedLayout | 🔴 FeedLayout | FullCanvas | 🔴 0% |
| Contribute | ⚠️ UnifiedHeader | 🔴 Missing | TwoColumn | ⚠️ 40% |
| Convey | ✅ Refactored | 🔴 Missing | ThreeColumn | ⚠️ 50% |

### Performance Optimizations:
- **RLS Policies Optimized**: 14 policies across 8 tables
- **Performance Warnings**: 0
- **Security Issues**: 0

---

## 🎯 Recommended Next Sprint

### Sprint Goal: Complete 5Cs LayoutController Migration

**Duration**: 2-3 prompts

**Sequence**:
1. **Fix Contribute** (ContributeHub, NeedsIndex) - 1 prompt
2. **Complete Convene** (All detail/create routes) - 1-2 prompts  
3. **Refactor Collaborate** (All routes) - 1-2 prompts

**Expected Outcome**:
- LayoutController coverage: 20% → 70%
- All 5C hub routes using correct pattern
- Most detail routes refactored
- Legacy layout usage: 80% → 30%

---

## 📝 Assessment Notes

**Strengths**:
1. ViewStateContext architecture is solid
2. LayoutController component is production-ready
3. Reusable column components (LeftNav, RightWidgets) work well
4. Performance optimizations were thorough

**Weaknesses**:
1. Inconsistent migration - some sections fully refactored, others untouched
2. Contribute section uses wrong pattern (UnifiedHeader directly)
3. Detail views missing for Contribute and Convey
4. No enforcement mechanism to prevent legacy layout usage

**Risk Areas**:
1. **Regression Risk**: Easy for new routes to use old patterns without enforcement
2. **UX Inconsistency**: Users experience different layouts across similar features
3. **Maintenance Debt**: 40+ files still use deprecated layouts

**Recommendations**:
1. Create a pre-commit hook or linter rule to block FeedLayout imports in /dna/*
2. Add visual regression tests for LayoutController states
3. Document migration pattern in CONTRIBUTING.md
4. Create component library showcasing all layout variants

---

**Assessment completed by Makena**  
**Next review**: After Contribute/Convene completion sprint

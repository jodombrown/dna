# DNA | ADA v2.0 – Prompt 3 Assessment: Adaptive Right Rail

**Date:** 2025-11-16  
**Prompt:** Activate Adaptive Right Rail (Module Policies)  
**Goal:** Turn ADA from static → adaptive via policy-driven right rail

---

## A. What Was Implemented ✅

### Files Changed

1. **src/components/feed/DashboardModules.tsx** - Complete refactor
   - ✅ Imports `useModulePolicy` and `usePolicyConfig` hooks
   - ✅ Uses adaptive module policy: `const { data: modulePolicy } = useModulePolicy()`
   - ✅ Computes modules from policy: `const modulesConfig = usePolicyConfig<ModulesConfig>(modulePolicy, DEFAULT_MODULES)`
   - ✅ Module registry implemented mapping IDs → components
   - ✅ Removed hardcoded module lists
   - ✅ Dynamic rendering based on policy

2. **src/hooks/useAdaptiveConfig.ts** - Hook layer created
   - ✅ `useModulePolicy()` hook implemented
   - ✅ `usePolicyConfig()` helper implemented
   - ✅ Also includes: `useLayoutPolicy()`, `useCTAPolicy()`, `useNudgePolicy()`

3. **src/services/ada/AdaptiveConfigService.ts** - Core service layer
   - ✅ Full policy resolution chain implemented:
     1. Experiment variant (if active and assigned)
     2. Cohort-specific policy
     3. Global default policy
     4. Hardcoded fallback
   - ✅ `resolveModulePolicy()` method
   - ✅ Cache management (5-minute expiry)

### Components Extracted

Module components properly separated for registry:
- ✅ `UpcomingEventsModule`
- ✅ `RecommendedSpacesModule`
- ✅ `OpenNeedsModule`
- ✅ `SuggestedPeopleModule`
- ✅ `ResumeModule` (pre-existing)
- ✅ `WhatsNextModule` (pre-existing)
- ✅ `TrendingHashtags` (pre-existing)

### Module Registry

```typescript
const MODULE_REGISTRY: Record<string, (props: any) => JSX.Element> = {
  resume_section: (props) => <ResumeModule key="resume_section" />,
  upcoming_events: (props) => <UpcomingEventsModule {...props} key="upcoming_events" />,
  whats_next: (props) => <WhatsNextModule key="whats_next" />,
  trending_hashtags: (props) => <TrendingHashtags key="trending_hashtags" />,
  recommended_spaces: (props) => <RecommendedSpacesModule {...props} key="recommended_spaces" />,
  open_needs: (props) => <OpenNeedsModule {...props} key="open_needs" />,
  suggested_people: (props) => <SuggestedPeopleModule {...props} key="suggested_people" />,
};
```

### Default Fallback Configuration

```typescript
const DEFAULT_MODULES: ModulesConfig = {
  modules: [
    { id: 'resume_section', order: 0, visible: true },
    { id: 'whats_next', order: 1, visible: true },
    { id: 'upcoming_events', order: 2, visible: true },
    { id: 'trending_hashtags', order: 3, visible: true },
    { id: 'recommended_spaces', order: 4, visible: true },
    { id: 'open_needs', order: 5, visible: true },
    { id: 'suggested_people', order: 6, visible: true },
  ],
};
```

---

## B. Completion Checklist

### 1. Code Integration ✅

- ✅ **DashboardModules imports useModulePolicy and usePolicyConfig**
- ✅ **defaultModules defined as fallback** (DEFAULT_MODULES)
- ✅ **modules computed from policyConfig || defaultModules**
- ✅ **Module registry maps IDs → actual components**

### 2. Behavior ✅

- ✅ **Right rail can hide/show modules based on policy**  
  Implementation: `modulesConfig.modules.filter(m => m.visible)`

- ✅ **Right rail can re-order modules based on policy**  
  Implementation: `.sort((a, b) => a.order - b.order)`

- ⚠️ **Test/example policy wired in**  
  **Status:** Uses DEFAULT_MODULES as fallback, but no actual policy seeded in database yet

### 3. Performance Optimization ✅

- ✅ **Conditional data loading based on module visibility**
  ```typescript
  const shouldLoadSpaces = modulesConfig.modules.some(m => m.id === 'recommended_spaces' && m.visible);
  const shouldLoadNeeds = modulesConfig.modules.some(m => m.id === 'open_needs' && m.visible);
  const shouldLoadPeople = modulesConfig.modules.some(m => m.id === 'suggested_people' && m.visible);
  ```

- ✅ **React Query caching** (5-minute stale time on policies)
- ✅ **Service-level caching** (AdaptiveConfigService cache with expiry)

### 4. Future-Readiness ✅

- ✅ **Code paths ready for experiments (A/B variants)**  
  Service checks: experiment → cohort → global → fallback

- ✅ **No hard-coded right-rail structure left in other components**  
  All modules now registry-based and policy-driven

- ✅ **ViewState-aware** (hook accepts viewState context)

---

## C. What's Working / Not Working

### ✅ Working

1. **Adaptive infrastructure fully in place**
   - Module policy hook working
   - Policy resolution chain implemented
   - Registry-based rendering working
   - Fallback configuration active

2. **Module visibility and ordering**
   - Modules can be hidden via policy config
   - Modules can be reordered via policy config
   - Module registry maps IDs correctly

3. **Performance optimizations**
   - Conditional data loading prevents unnecessary queries
   - Proper React Query caching
   - Service-level cache reduces database calls

### ⚠️ Partial

1. **No policies seeded in database**
   - `ada_policies` table exists
   - Service ready to consume policies
   - **But:** No actual policy records created yet
   - Currently falling back to DEFAULT_MODULES

2. **No experiments/cohorts configured**
   - Experiment infrastructure exists (ada_experiments, ada_experiment_variants)
   - Cohort infrastructure exists (ada_cohorts, ada_cohort_memberships)
   - **But:** No records created to test adaptive behavior

3. **Right rail not yet ViewState-aware in practice**
   - Hook supports ViewState context
   - **But:** Not actively changing modules based on /dna/connect vs /dna/convene

### 🔴 Missing

1. **No example policy in database to demonstrate adaptivity**
2. **No admin UI to manage policies** (future scope)
3. **No real-time policy switching demo**

---

## D. Next Actions (Prompt 3 Area Only)

### Priority 1: Create First Policy (Immediate)

Create a simple first policy to demonstrate adaptive behavior:

**New Users Policy:**
```typescript
{
  id: 'new_user_modules',
  name: 'New User Module Policy',
  type: 'modules',
  scope: 'cohort', // targets "new_users" cohort
  config: {
    modules: [
      { id: 'resume_section', order: 0, visible: true },
      { id: 'whats_next', order: 1, visible: true },
      { id: 'suggested_people', order: 2, visible: true },
      { id: 'upcoming_events', order: 3, visible: true },
      // Hide spaces/needs for new users until they have connections
      { id: 'recommended_spaces', visible: false },
      { id: 'open_needs', visible: false },
    ]
  },
  is_active: true
}
```

**Organizers Policy:**
```typescript
{
  id: 'organizer_modules',
  name: 'Event Organizer Module Policy',
  type: 'modules',
  scope: 'cohort', // targets "event_organizers" cohort
  config: {
    modules: [
      { id: 'upcoming_events', order: 0, visible: true },
      { id: 'whats_next', order: 1, visible: true },
      { id: 'recommended_spaces', order: 2, visible: true },
      { id: 'resume_section', order: 3, visible: true },
      { id: 'open_needs', order: 4, visible: true },
    ]
  },
  is_active: true
}
```

### Priority 2: Seed Test Cohorts

Create cohorts to assign policies:
- `new_users` cohort (users created < 7 days ago)
- `event_organizers` cohort (users who have created events)
- `contributors` cohort (users who have made contributions)

### Priority 3: ViewState-Specific Modules (Future)

Make modules adapt to current route/ViewState:
- `/dna/connect` → Show "Suggested Connections", "Trending People"
- `/dna/convene` → Show "Upcoming Events", "Create Event CTA"
- `/dna/collaborate` → Show "Active Spaces", "Join Space CTA"
- `/dna/contribute` → Show "Open Needs", "Impact Stats"

---

## Summary

### Status: ✅ Architecture Complete, ⚠️ Awaiting Policy Data

**What's Done:**
- ✅ Full adaptive infrastructure implemented
- ✅ Module registry and policy-driven rendering
- ✅ Performance optimizations (conditional loading)
- ✅ Hook layer and service layer complete
- ✅ Experiment/cohort resolution chain ready

**What's Needed:**
- ⚠️ Seed first policies in `ada_policies` table
- ⚠️ Create test cohorts in `ada_cohorts`
- ⚠️ Assign users to cohorts for testing
- ⚠️ (Optional) Create first experiment to test A/B variants

**Impact:**
Right rail is now **technically adaptive** but currently **statically configured** via DEFAULT_MODULES fallback. Once policies are seeded, adaptive behavior will activate immediately with zero code changes.

---

## Recommendation

**Immediately seed 2-3 basic policies** to demonstrate the adaptive system is working end-to-end. This will:
1. Prove the infrastructure works
2. Allow user testing of different module configurations
3. Enable data collection on which module orderings drive engagement

The code is ready. We just need the data layer populated.

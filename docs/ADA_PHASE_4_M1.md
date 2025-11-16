# ADA Phase 4 - M1: Adaptive Config & Experiment Framework

## Overview

M1 establishes the foundation for autonomous personalization in DNA's Adaptive Dashboard Architecture. This milestone introduces:

1. **Central configuration layer** for ADA policies
2. **Cohort-based segmentation** for targeted experiences
3. **Experiment framework** for A/B testing and optimization
4. **Admin UI** for non-developer policy management

## Key Components

### 1. Database Schema

#### `ada_policies`
Stores configurable ADA behaviors.

**Fields:**
- `id` (UUID, PK)
- `name` (TEXT, unique) - Policy identifier
- `description` (TEXT) - What this policy does
- `type` (ENUM: layout, modules, cta, nudge, other)
- `scope` (ENUM: global, cohort, experiment_variant)
- `config` (JSONB) - Policy configuration
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

**Example Policies:**

```json
// Module order policy
{
  "name": "default_feed_modules",
  "type": "modules",
  "scope": "global",
  "config": {
    "modules_order": ["resume_section", "whats_next", "upcoming_events"],
    "modules_required": ["resume_section"],
    "modules_optional": ["upcoming_events"]
  }
}

// CTA strategy policy
{
  "name": "event_ctas_founders",
  "type": "cta",
  "scope": "cohort",
  "config": {
    "entity_type": "event",
    "ctas": [
      {"id": "join_space", "priority": 1},
      {"id": "connect_attendees", "priority": 2}
    ]
  }
}
```

#### `ada_cohorts`
Defines user segments.

**Fields:**
- `id` (UUID, PK)
- `name` (TEXT, unique)
- `description` (TEXT)
- `criteria` (JSONB) - Membership rules
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

**Example Cohort Criteria:**

```json
{
  "role_in": ["Founder", "Entrepreneur"],
  "region_in": ["North America", "Europe"],
  "min_events_attended": 2
}
```

#### `ada_experiments`
Defines A/B tests and experiments.

**Fields:**
- `id` (UUID, PK)
- `name`, `description` (TEXT)
- `status` (ENUM: draft, running, paused, completed)
- `target_policy_type` (ENUM)
- `target_route` (TEXT, optional)
- `cohort_id` (UUID, FK, nullable)
- `start_at`, `end_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at`

#### `ada_experiment_variants`
Variants within experiments.

**Fields:**
- `id` (UUID, PK)
- `experiment_id` (UUID, FK)
- `name` (TEXT) - e.g., "control", "variant_a"
- `policy_id` (UUID, FK → ada_policies)
- `allocation` (FLOAT, 0-1) - Traffic split
- `created_at`, `updated_at`

#### `ada_experiment_assignments`
Tracks user assignments to variants.

**Fields:**
- `id` (UUID, PK)
- `experiment_id` (UUID, FK)
- `user_id` (UUID, FK)
- `variant_id` (UUID, FK)
- `assigned_at` (TIMESTAMPTZ)

**Unique constraint:** `(experiment_id, user_id)` - one assignment per experiment

#### `ada_cohort_memberships`
Caches cohort membership for performance.

**Fields:**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `cohort_id` (UUID, FK)
- `computed_at` (TIMESTAMPTZ)
- `expires_at` (TIMESTAMPTZ) - Cache expiry

### 2. Services

#### `AdaptiveConfigService`
**Location:** `src/services/ada/AdaptiveConfigService.ts`

Resolves policies for users based on priority:
1. Experiment variant policy (highest)
2. Cohort-specific policy
3. Global default policy
4. Hardcoded fallback

**Key Methods:**
- `getPolicyForUser(userId, type, context)` - Main resolution method
- `resolveLayoutPolicy(userId, viewState)`
- `resolveModulePolicy(userId, route)`
- `resolveCTAPolicy(userId, entityType)`
- `resolveNudgePolicy(userId)`

**Usage:**
```typescript
import { adaptiveConfigService } from '@/services/ada/AdaptiveConfigService';

const resolution = await adaptiveConfigService.getPolicyForUser(
  userId,
  'modules',
  { route: '/dna/feed' }
);

if (resolution.policy) {
  const modulesConfig = resolution.policy.config;
  // Use modulesConfig to render right rail
}
```

#### `CohortEvaluationService`
**Location:** `src/services/ada/CohortEvaluationService.ts`

Evaluates which cohorts a user belongs to.

**Key Methods:**
- `getUserCohorts(userId, forceRefresh)` - Get all user's cohorts (cached)
- `isUserInCohort(userId, cohortId)` - Check specific membership
- `estimateCohortSize(cohortId)` - Approximate cohort size
- `refreshUserCohorts(userId)` - Force recompute

**Caching:**
- Memory cache: 1 hour
- Database cache: 1 hour
- Automatically refreshed when expired

#### `ExperimentService`
**Location:** `src/services/ada/ExperimentService.ts`

Manages experiment assignments and variant selection.

**Key Methods:**
- `getVariantForUser(userId, experimentId)` - Get/create assignment
- `getEligibleExperiments(userId, policyType, route)` - Find matching experiments
- `resolveExperimentPolicy(userId, policyType, route)` - Get active experiment policy
- `getExperimentStats(experimentId)` - View experiment metrics

**Assignment Logic:**
- Stable: Same user always gets same variant
- Weighted: Respects `allocation` percentages
- Persistent: Stored in database

### 3. React Hooks

**Location:** `src/hooks/useAdaptiveConfig.ts`

Convenient React hooks for policy access:

```typescript
// Get module policy
const { data: modulePolicy } = useModulePolicy('/dna/feed');
const config = usePolicyConfig(modulePolicy, defaultModuleConfig);

// Get layout policy
const { data: layoutPolicy } = useLayoutPolicy('DASHBOARD_HOME');

// Get CTA policy
const { data: ctaPolicy } = useCTAPolicy('event');

// Get nudge policy
const { data: nudgePolicy } = useNudgePolicy();
```

### 4. Database Functions

#### `evaluate_cohort_criteria(user_id, criteria)`
Evaluates if a user matches cohort criteria.

**Supported Criteria:**
- `role_in` - User role must be in list
- `region_in` - User location must be in list
- `min_events_attended` - Minimum events attended
- `max_account_age_days` - Account must be newer than X days

#### `get_user_cohorts(user_id)`
Returns all cohorts a user belongs to.

## Integration Points

### Right Rail Module Order

**Before (Phase 3):**
```typescript
// Hardcoded module order
const modules = [
  'resume_section',
  'whats_next',
  'upcoming_events',
  // ...
];
```

**After (Phase 4-M1):**
```typescript
import { useModulePolicy, usePolicyConfig } from '@/hooks/useAdaptiveConfig';

const { data: modulePolicy } = useModulePolicy();
const defaultConfig = { modules_order: [...] };
const config = usePolicyConfig(modulePolicy, defaultConfig);

// Render modules in config.modules_order
```

### CTA Ranking

**Before:**
```typescript
// Static CTA order
const ctas = [
  { id: 'join_space', priority: 1 },
  { id: 'rsvp', priority: 2 },
];
```

**After:**
```typescript
import { useCTAPolicy, usePolicyConfig } from '@/hooks/useAdaptiveConfig';

const { data: ctaPolicy } = useCTAPolicy('event');
const defaultCTAs = [...];
const config = usePolicyConfig(ctaPolicy, { ctas: defaultCTAs });

// Use config.ctas sorted by priority
```

## Fallback Behavior

**Critical:** If any service fails or policy is missing, ADA must fall back gracefully:

1. **AdaptiveConfigService**: Returns `null` policy with `source: 'fallback'`
2. **React Components**: Use `usePolicyConfig(policy, fallback)` to provide defaults
3. **Error Handling**: All services log errors but don't crash

**Example:**
```typescript
const { data: policy } = useModulePolicy();
const config = usePolicyConfig(policy, {
  modules_order: ['resume_section', 'whats_next'], // Fallback
});

// config is ALWAYS defined, either from policy or fallback
```

## Default Policies

Four default global policies are created on migration:

1. **default_feed_modules** - Right rail module order for `/dna/feed`
2. **default_layout** - Three-column layout configuration
3. **default_event_ctas** - CTA strategy for event detail pages
4. **default_nudge_limits** - Nudge frequency caps

## RLS Policies

All tables have Row Level Security:

- **Admins** can manage all policies, cohorts, and experiments
- **Authenticated users** can view active policies and their own assignments
- **System** (authenticated role) can create experiment assignments

## Performance Considerations

1. **Caching**:
   - AdaptiveConfigService: 5-minute memory cache
   - CohortEvaluationService: 1-hour memory + database cache
   - React Query: 5-minute stale time

2. **Indexes**:
   - All foreign keys indexed
   - Type, status, and active flags indexed
   - Expiry timestamps indexed for cleanup

3. **Query Optimization**:
   - Single queries with joins (not N+1)
   - Database-side cohort evaluation
   - Cached cohort memberships

## Monitoring & Metrics

### Experiment Stats

```typescript
const stats = await experimentService.getExperimentStats(experimentId);
// Returns:
// {
//   total_assignments: 150,
//   variants: [
//     { name: 'control', count: 75 },
//     { name: 'variant_a', count: 75 }
//   ]
// }
```

### Cohort Size

```typescript
const size = await cohortEvaluationService.estimateCohortSize(cohortId);
// Returns approximate count of users in cohort
```

## Next Steps (Future Milestones)

**M2 - Runtime Adaptation:**
- Use policies to adapt layouts dynamically
- Module visibility toggling
- 5C emphasis adjustment

**M3 - Closed-loop Optimization:**
- Bandit algorithms for variant selection
- Automatic policy updates based on outcomes
- KPI tracking per variant

**M4 - Admin Co-Pilot:**
- AI-powered policy suggestions
- Automated experiment creation
- Performance insights

**M5 - Fairness & Safety:**
- Bias detection
- Diversity constraints
- User transparency controls

## Acceptance Criteria

- [x] All 6 database tables created with indexes and RLS
- [x] AdaptiveConfigService implemented and tested
- [x] CohortEvaluationService implemented and tested
- [x] ExperimentService implemented and tested
- [x] React hooks for policy access created
- [x] Database functions for cohort evaluation created
- [x] Default policies inserted
- [x] Fallback behavior implemented
- [x] Documentation complete

## Notes

- **Non-breaking**: All changes are additive. Phase 3 behavior continues if policies are not configured
- **Gradual adoption**: Can enable adaptive config per surface incrementally
- **Admin-friendly**: Designed for non-developer configuration via upcoming admin UI
- **Scalable**: Optimized for thousands of users and hundreds of experiments

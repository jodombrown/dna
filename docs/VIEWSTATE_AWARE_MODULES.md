# ViewState-Aware Right Rail Modules (5C Context-Aware)

## Overview

The right rail modules are now context-aware based on which of the 5Cs (ViewState) the user is in. Different routes show different module mixes while still respecting the ADA adaptive policy system.

## Implementation

### 1. ViewState Module Presets (`src/config/viewStateModules.ts`)

Created ViewState-specific module configurations for each of the 5Cs:

- **CONNECT_MODE**: People & networking focused
  - Priority: `suggested_people`, `resume_section`, `whats_next`, `trending_hashtags`
  - Hidden: `recommended_spaces`

- **CONVENE_MODE**: Events & gatherings focused
  - Priority: `upcoming_events`, `recommended_spaces`, `open_needs`
  - Hidden: `whats_next`, `resume_section`

- **COLLABORATE_MODE**: Spaces & projects focused
  - Priority: `recommended_spaces`, `open_needs`, `upcoming_events`
  - Hidden: `resume_section`

- **CONTRIBUTE_MODE**: Needs & impact focused
  - Priority: `open_needs`, `whats_next`, `recommended_spaces`
  - Hidden: `suggested_people`, `trending_hashtags`

- **CONVEY_MODE**: Stories & content focused
  - Priority: `trending_hashtags`, `featured_stories`, `suggested_people`
  - Hidden: `recommended_spaces`, `open_needs`

- **DASHBOARD_HOME**: Balanced overview
  - All modules visible with balanced priorities

- **MESSAGES_MODE**: Minimal for focused messaging
- **FOCUS_DETAIL_MODE**: Minimal for detail views

### 2. Updated Policy Resolution (`src/services/ada/AdaptiveConfigService.ts`)

- `resolveModulePolicy()` now accepts `viewState` parameter
- Passes ViewState context to policy resolution chain

### 3. Updated Hooks (`src/hooks/useAdaptiveConfig.ts`)

- `useModulePolicy()` now accepts `viewState` parameter
- Query key includes ViewState for proper caching

### 4. Updated DashboardModules (`src/components/feed/DashboardModules.tsx`)

- Gets current `viewState` from `ViewStateContext`
- Passes `viewState` to `useModulePolicy(viewState)`
- Uses ViewState-specific preset as fallback before global DEFAULT_MODULES

## Policy Resolution Order

The final module configuration is resolved in this priority order:

1. **ViewState-specific cohort/experiment policy** (most specific)
   - E.g., "new_users in CONVENE_MODE" policy from ADA
   
2. **Global cohort/experiment policy**
   - E.g., "event_organizers" policy applies everywhere

3. **ViewState-specific default preset** (defined in `viewStateModules.ts`)
   - E.g., CONVENE_MODE shows event-focused modules by default

4. **Global DEFAULT_MODULES constant** (hardcoded fallback)
   - Only used if ViewState preset doesn't exist

## How ViewState + Cohort Combine

### Example 1: New User in CONVENE_MODE
```
User: New user (< 7 days old) browsing events
ViewState: CONVENE_MODE
Resolution:
  → Check: "new_users + CONVENE_MODE" policy (none exists)
  → Check: "new_users" global policy ✓ (returns new_user_modules config)
  → Result: Shows onboarding-focused modules from ADA policy
```

### Example 2: Event Organizer in COLLABORATE_MODE
```
User: Experienced user who creates events
ViewState: COLLABORATE_MODE  
Resolution:
  → Check: "event_organizers + COLLABORATE_MODE" policy (none exists)
  → Check: "event_organizers" global policy ✓ (returns organizer_modules config)
  → Result: Shows event/space management modules from ADA policy
```

### Example 3: Regular User in CONTRIBUTE_MODE
```
User: Regular user (no special cohort)
ViewState: CONTRIBUTE_MODE
Resolution:
  → Check: cohort policy (none exists)
  → Check: global policy (none exists)
  → Fallback: CONTRIBUTE_MODE ViewState preset ✓
  → Result: Shows contribution-focused modules (open_needs, whats_next, etc.)
```

## Adding New ViewState-Specific Overrides

### Option 1: Hardcoded Preset (Recommended for MVP)
Edit `src/config/viewStateModules.ts`:

```typescript
export const VIEWSTATE_MODULE_PRESETS: Record<ViewState, ViewStateModulePreset> = {
  // ... existing presets ...
  
  NEW_VIEWSTATE: {
    modules: [
      { id: 'module_a', order: 1, visible: true },
      { id: 'module_b', order: 2, visible: true },
      { id: 'module_c', order: 3, visible: false },
    ],
  },
};
```

### Option 2: ADA Policy (For A/B Testing & Experiments)

Create ViewState-specific policy in `ada_policies`:

```sql
INSERT INTO ada_policies (name, type, scope, config, is_active)
VALUES (
  'Contribute Mode - Event Organizers',
  'modules',
  'cohort',
  '{
    "cohort_id": "event_organizers",
    "viewState": "CONTRIBUTE_MODE",
    "modules": [
      {"id": "open_needs", "order": 1, "visible": true},
      {"id": "upcoming_events", "order": 2, "visible": true}
    ]
  }',
  true
);
```

This allows experimentation: "Do event organizers in CONTRIBUTE mode prefer seeing upcoming_events first or open_needs first?"

## Testing Different Configurations

### Test ViewState Defaults
1. Navigate to different 5Cs: `/dna/connect`, `/dna/convene`, `/dna/contribute`, etc.
2. Observe right rail modules change based on context
3. Check browser DevTools → React Query → `module-policy` cache for resolved config

### Test ADA Policy Overrides
1. Assign user to cohort (or simulate via cohort membership)
2. Create cohort-specific module policy in database
3. Navigate to different ViewStates
4. Policy should override ViewState defaults

## Architecture Benefits

✅ **Centralized**: One place to define ViewState defaults (`viewStateModules.ts`)  
✅ **Flexible**: ADA policies can override any ViewState at cohort or experiment level  
✅ **Performant**: ViewState included in query cache key for efficient re-rendering  
✅ **Scalable**: Easy to add new ViewStates or modules without touching policy resolution logic  
✅ **Testable**: Clear resolution order makes debugging straightforward  

## Future Enhancements

1. **ViewState + Cohort Combo Policies**: Create policies that target specific cohort-ViewState combinations
2. **Analytics Integration**: Track which module configurations drive engagement per ViewState
3. **User Preferences**: Allow users to customize modules within ViewState constraints
4. **Dynamic Module Loading**: Lazy-load module data only when visible per ViewState

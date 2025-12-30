# COLLABORATE Architecture Audit

**Date**: 2024-12-30
**Auditor**: Claude
**Patterns Evaluated**: Dual Output Pattern, Admin Parallel Track

---

## Executive Summary

COLLABORATE (Pillar 3) has solid foundational architecture for space/project management but lacks the **accountability architecture** needed for Asana-level project management. Critical gaps exist in:
1. **No DIA nudges** for project health, stalls, or completion
2. **No archive/delete** functionality for spaces
3. **No admin space management** platform
4. **No dedicated Profile Spaces tab** (embedded in Activity section instead)
5. **No discovery filters** in Spaces index

---

## Architecture Assessment

### 1. USER CREATION FLOW

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Space appears in Collaborate Hub | ✅ | ✅ Implemented | None - `CollaborateHub.tsx:94-141` shows My Spaces (Leading/Contributing) |
| Space appears in main Feed | ✅ | ✅ Implemented | None - `useSpaceMutations.ts:126-141` calls `createSpacePost()` on creation |
| Space appears on user profile | ✅ | ⚠️ Partial | Appears in Activity section only, not dedicated tab - `ProfileV2Activity.tsx:55-86` |
| User can edit spaces | ✅ | ✅ Implemented | `SpaceSettings.tsx` - General settings, name, description, visibility |
| User can archive spaces | ✅ | ❌ Missing | **BUILD**: Add archive status + archive flow with summary |
| User can delete spaces | ✅ | ❌ Missing | **BUILD**: Add soft delete + confirmation dialog |
| User sees space analytics | ✅ | ✅ Implemented | `SpaceInsights.tsx` - leads see activity, task health, engagement signals |

### 2. USER ENGAGEMENT FLOW

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Joined spaces appear on profile | ✅ | ⚠️ Partial | Shows in Activity section with role badge - `ProfileV2Activity.tsx:55-86` |
| User sees all member spaces | ✅ | ✅ Implemented | `MySpaces.tsx` with tabs for Leading/Contributing |
| User can leave space | ✅ | ✅ Implemented | `useSpaceMutations.ts:34-60` - validates not last lead |
| User's task contributions tracked | ✅ | ❌ Missing | **BUILD**: Track tasks completed per user, show on profile |
| User's contribution summary on profile | ✅ | ❌ Missing | **BUILD**: "Completed X tasks across Y spaces" |

### 3. ACCOUNTABILITY ARCHITECTURE (Critical Gaps)

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| DIA monitors project health | ✅ | ❌ Missing | **BUILD**: Edge function to check space health daily |
| Stall detection nudges | ✅ | ❌ Missing | **BUILD**: "This project hasn't had activity in X days" nudge |
| Completion nudges | ✅ | ❌ Missing | **BUILD**: "3 tasks remaining - you're almost done!" nudge |
| Overdue task nudges | ✅ | ❌ Missing | **BUILD**: Notify assignees of overdue tasks |
| Organizer-to-member nudges | ✅ | ❌ Missing | **BUILD**: Allow leads to send nudges to team members |
| Graceful shutdown flow | ✅ | ❌ Missing | **BUILD**: Archive wizard with summary, impact report |
| Space completion celebration | ✅ | ❌ Missing | **BUILD**: Celebration UX when space marked completed |

**Current Nudge System**: `useDiaNudges.ts` exists for connections but has no space-specific nudge types.

### 4. DISCOVERY FLOW

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Public spaces discoverable | ✅ | ✅ Implemented | `SpacesIndex.tsx` - lists all public spaces |
| Filter by category | ✅ | ❌ Missing | **BUILD**: Add focus_areas filter to SpacesIndex |
| Filter by status | ✅ | ❌ Missing | **BUILD**: Add status filter (active, idea, etc.) |
| Filter by region | ✅ | ❌ Missing | **BUILD**: Add region filter |
| Filter by space type | ✅ | ❌ Missing | **BUILD**: Add project/initiative/working_group filter |
| Search spaces | ✅ | ❌ Missing | **BUILD**: Add search input to SpacesIndex |
| DIA recommends spaces | ✅ | ✅ Implemented | `SuggestedSpaces.tsx` - scores by focus area, region, recency |
| Request to join private spaces | ✅ | ❌ Missing | **BUILD**: Join request flow for invite_only spaces |

### 5. ADMIN CAPABILITIES

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Admin sees all spaces | ✅ | ❌ Missing | **BUILD**: `AdminSpaces.tsx` - list all spaces platform-wide |
| Admin space moderation | ✅ | ❌ Missing | **BUILD**: Flag, hide, remove spaces |
| Admin space analytics | ✅ | ⚠️ Partial | `ConveyAnalytics.tsx` shows CONVEY activity by space, not COLLABORATE metrics |
| Admin dispute intervention | ✅ | ❌ Missing | **BUILD**: Admin tools for member disputes |
| Platform-wide space health dashboard | ✅ | ❌ Missing | **BUILD**: Admin view of stalled/at-risk projects |
| Admin bulk actions on spaces | ✅ | ❌ Missing | **BUILD**: Bulk archive, feature, moderate |

**Existing Admin Pages** (`/src/pages/admin/`):
- `ContentModeration.tsx` - Posts/comments only, no spaces
- `Moderation.tsx` - Generic content flags, no space-specific
- `UserManagement.tsx` - User actions
- `EngagementDashboard.tsx` - General metrics

### 6. PROFILE INTEGRATION

| Feature | Expected | Current Status | Gap/Action Needed |
|---------|----------|----------------|-------------------|
| Dedicated "Spaces" tab on ProfileV2 | ✅ | ❌ Missing | **BUILD**: `ProfileV2Spaces.tsx` as dedicated tab |
| "Created" section | ✅ | ❌ Missing | **BUILD**: Show spaces user created/leads |
| "Member Of" section | ✅ | ❌ Missing | **BUILD**: Show spaces user contributes to |
| Space count visible | ✅ | ⚠️ Partial | Shows in Activity but not prominently |
| Link to My Spaces | ✅ | ❌ Missing | **BUILD**: CTA to view all spaces |

**Current Implementation**: Spaces embedded in `ProfileV2Activity.tsx:55-86` alongside connections/events.

---

## Dual Output Pattern Compliance

| Creation Action | Pillar Hub | Main Feed | Profile | Status |
|-----------------|------------|-----------|---------|--------|
| Create Space | ✅ CollaborateHub | ✅ Feed post | ⚠️ Activity section | **Partial** - Needs dedicated tab |
| Join Space | ✅ MySpaces | ❌ No feed item | ⚠️ Activity section | **Partial** |
| Complete Task | ❌ Not shown | ❌ No feed item | ❌ Not tracked | **Missing** |
| Archive Space | ❌ N/A | ❌ No feed item | ❌ N/A | **Not Implemented** |

---

## Admin Parallel Track Compliance

| User Feature | Expected Admin Counterpart | Status |
|--------------|---------------------------|--------|
| Create Space | Admin view all spaces | ❌ Missing |
| Space Insights | Platform space analytics | ❌ Missing |
| Space Settings | Admin moderate spaces | ❌ Missing |
| Member Management | Admin intervene disputes | ❌ Missing |
| Task Management | Admin view task health | ❌ Missing |

---

## Files Analyzed

### Pages
- `/src/pages/dna/collaborate/CollaborateHub.tsx` - Hub landing
- `/src/pages/dna/collaborate/CreateSpace.tsx` - Creation form
- `/src/pages/dna/collaborate/SpaceDetail.tsx` - Detail view
- `/src/pages/dna/collaborate/MySpaces.tsx` - User's spaces
- `/src/pages/dna/collaborate/SpacesIndex.tsx` - All spaces list
- `/src/pages/dna/collaborate/SpaceSettings.tsx` - Space admin
- `/src/pages/ProfileV2.tsx` - Profile page

### Components
- `/src/components/collaboration/SpaceInsights.tsx` - Analytics (lead-only)
- `/src/components/collaboration/SuggestedSpaces.tsx` - DIA recommendations
- `/src/components/profile-v2/ProfileV2Activity.tsx` - Spaces in activity
- `/src/components/profile/cross-5c/ProfileSpacesSection.tsx` - Legacy component

### Hooks
- `/src/hooks/useSpaces.ts` - Query hooks
- `/src/hooks/useSpaceMutations.ts` - CRUD mutations
- `/src/hooks/useDiaNudges.ts` - General nudge system (no space nudges)

### Services
- `/src/lib/feedWriter.ts` - `createSpacePost()` for feed integration

---

## Priority Action Items

### P0 - Critical (Accountability Gap)
1. **Build DIA Space Nudges Edge Function**
   - File: `supabase/functions/space-health-nudges/index.ts`
   - Stall detection (no activity 7+ days)
   - Overdue task alerts
   - Completion encouragement

2. **Build Admin Space Management**
   - File: `/src/pages/admin/AdminSpaces.tsx`
   - List all spaces with metrics
   - Moderate/flag/hide actions
   - Bulk operations

### P1 - High Priority
3. **Add Archive/Delete to Spaces**
   - Modify: `SpaceSettings.tsx`
   - Add: Archive wizard with summary generation
   - Status: 'archived' with read-only view

4. **Build Discovery Filters**
   - Modify: `SpacesIndex.tsx`
   - Add: Category, status, region, type filters
   - Add: Search input

5. **Build ProfileV2Spaces Tab**
   - File: `/src/components/profile-v2/ProfileV2Spaces.tsx`
   - Split: Created vs Member Of sections
   - Add: Space count, contribution stats

### P2 - Medium Priority
6. **Track User Contributions**
   - Modify: Profile queries to count tasks completed
   - Add: Contribution summary to ProfileV2

7. **Add Join Request Flow**
   - For invite_only spaces
   - Notification to space leads

8. **Feed Items for More Actions**
   - Join space feed item
   - Task completion (optional/private)

### P3 - Enhancement
9. **Organizer-to-Member Nudges**
   - In-app nudge from lead to contributor
   - "Hey, can you update on task X?"

10. **Space Completion Celebration**
    - Celebration modal when status→completed
    - Impact summary generation

---

## Implementation Estimates

| Item | Files Changed | Complexity |
|------|--------------|------------|
| DIA Space Nudges | 3-4 new files | Medium |
| Admin Space Management | 2-3 new files | Medium |
| Archive/Delete | 2-3 modified files | Low-Medium |
| Discovery Filters | 1 modified file | Low |
| ProfileV2Spaces Tab | 2-3 new/modified files | Medium |
| User Contribution Tracking | 3-4 modified files | Medium |

---

## Conclusion

COLLABORATE has **60% of expected functionality**:
- ✅ Core CRUD for spaces
- ✅ Basic feed integration
- ✅ Member management
- ✅ Task management within spaces
- ✅ Lead-only insights

Critical gaps preventing "Asana-level" experience:
- ❌ Zero accountability nudges
- ❌ No admin oversight
- ❌ No discovery filters
- ❌ No archive/cleanup flows
- ❌ Profile integration is minimal

**Recommendation**: Focus on P0 (DIA nudges + Admin) and P1 (Archive + Filters + Profile) to reach **85%+ completion**.

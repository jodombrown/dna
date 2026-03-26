

# Fix: Space Creation Fails with RLS Policy Error

## Problem
When a user completes the 4-step Space Creation Wizard and clicks "Create Space", it fails silently with error `42501` (RLS policy violation on `spaces` table). The button shows "Creating..." indefinitely.

## Root Cause
The `spaces` table has two **required columns** (`NOT NULL`, no default) that the insert code never provides:

1. **`slug`** (text, NOT NULL, no default) -- completely missing from insert
2. **`space_type`** (text, NOT NULL, no default) -- completely missing from insert

PostgreSQL evaluates the RLS `WITH CHECK` before the full constraint check, but the missing required columns cause the insert to fail, surfacing as an RLS violation error.

## Secondary Issue
After successful creation, the wizard navigates to `/spaces/${space.id}` but the correct route is `/dna/collaborate/spaces/${space.slug}`.

## Fix Plan

### 1. Fix `useCreateSpace` in `src/hooks/useCollaborate.ts`
- Generate a `slug` from the space name (lowercase, hyphenated, with random suffix for uniqueness)
- Add `space_type` field (default to `'community_project'` for non-template creation)
- Both `useCreateSpace` and `useCreateSpaceFromTemplate` need these fixes

### 2. Fix `useCreateSpaceFromTemplate` in `src/hooks/useCollaborate.ts`
- Generate `slug` same way
- Derive `space_type` from the template's `category` field (e.g., `learning` -> `mentorship_circle`, `investment` -> `investment_syndicate`, etc.)

### 3. Update `SpaceCreationWizard` navigation
- Change `navigate(/spaces/${space.id})` to `navigate(/dna/collaborate/spaces/${space.slug})`
- The slug is available from the returned space object

### 4. Add user-facing error feedback
- The wizard currently only does `console.error` on failure -- add a `toast.error` so the user knows something went wrong instead of the button just spinning

### Files Modified
| File | Change |
|------|--------|
| `src/hooks/useCollaborate.ts` | Add `slug` generation + `space_type` to both insert mutations |
| `src/components/collaborate/SpaceCreationWizard.tsx` | Fix navigation path, add error toast |

### Slug Generation Logic
```text
"Africa Tech Innovation Hub"
  → "africa-tech-innovation-hub-a3f2"
  (lowercase + hyphenate + 4-char random suffix)
```

### Template Category to Space Type Mapping
```text
learning        → mentorship_circle
investment      → investment_syndicate
community       → community_project
advocacy        → advocacy_campaign
professional    → startup
(default)       → community_project
```




# DNA Platform Error Audit & Fix Plan

## Issues Found (Prioritized by Impact)

### CRITICAL — Causes Crashes or Broken Features

**1. Conditional Hook Violation in UniversalComposer**
`src/components/composer/UniversalComposer.tsx` lines 98-103 wrap `useNavigate()` in a try/catch. This violates React's Rules of Hooks — hooks must not be called conditionally. While it may work in most cases, it can cause unpredictable crashes or stale closures, especially on hot reload or when React Strict Mode double-renders.

**Fix:** Move `useNavigate()` to the top level unconditionally (it will always be in a Router context in the real app). If test isolation is needed, mock the router in tests instead.

---

**2. Remaining `100vh` Usage (5 active files)**
These files still use `100vh` which causes content to be hidden behind mobile browser chrome:
- `src/components/convene/management/EventManagementLayout.tsx` — 5 instances of `h-[calc(100vh-64px)]`
- `src/pages/PitchDeck.tsx` — `h-[calc(100vh-5rem)]`
- `src/components/collaborations/CollaborationsMainContent.tsx` — `min-h-[calc(100vh-400px)]`

**Fix:** Replace all `100vh` with `100dvh` in these files (matching the migration done in the previous sprint).

---

### HIGH — Inconsistent UX, User-Facing Issues

**3. 28 Files Still Using Ad-Hoc Bottom Padding**
Despite creating the `pb-bottom-nav` utility class, 28 files still use hardcoded `pb-16`, `pb-20`, or `pb-safe` for bottom nav spacing. Key user-facing pages:
- `src/pages/dna/Notifications.tsx` — `pb-20 md:pb-0`
- `src/pages/dna/Messages.tsx` — `pb-16`
- `src/pages/dna/convene/ConveneDiscovery.tsx` — `pb-20 md:pb-0`
- `src/pages/dna/contribute/ContributeDiscovery.tsx` — `pb-20 md:pb-0`
- `src/pages/dna/convey/ConveyDiscovery.tsx` — `pb-20 md:pb-0`
- `src/pages/dna/FeedStoryDetail.tsx` — mixed `pb-16`/`pb-20`
- `src/pages/dna/Username.tsx` — `pb-16`
- `src/pages/dna/convey/ConveyStoryHub.tsx` — `pb-16 md:pb-0`
- `src/components/mobile/MobileFeedView.tsx` — `pb-20`

**Fix:** Replace with `pb-bottom-nav md:pb-0` in the 9 most critical user-facing pages listed above.

---

**4. Supabase Security Warnings (3 RLS Policies)**
The Supabase linter flags 3 tables with `USING (true)` or `WITH CHECK (true)` on INSERT/UPDATE/DELETE operations, plus 1 function with a mutable search_path. These are security vulnerabilities that could allow unauthorized data modification.

**Fix:** Identify the affected tables/functions via the SQL editor and tighten the policies. This requires a separate database investigation.

---

### MEDIUM — Code Quality & Maintainability

**5. `as any` Casts in ComposerBody (4 instances)**
`src/components/composer/ComposerBody.tsx` uses `as any` for form field types (`format`, `visibility`, `skillsNeeded`). These bypass TypeScript safety and can cause silent runtime errors.

**Fix:** Extend the `ComposerFormData` type to properly include these fields, removing the need for `as any`.

---

**6. Bokeh Animation Keyframe Still Uses `100vh`**
`src/index.css` line 691 — the `bokeh-drift-1` keyframe uses `translate(-20px, 100vh)`. While mostly cosmetic, it causes the animation start point to be off on mobile.

**Fix:** Replace `100vh` with `100dvh` in the keyframe.

---

## Implementation Plan (Ordered by Priority)

### Batch 1: Critical Fixes (3 files)
1. **Fix conditional hook** in `UniversalComposer.tsx` — move `useNavigate()` to top level
2. **Migrate `100vh` → `100dvh`** in `EventManagementLayout.tsx`, `PitchDeck.tsx`, `CollaborationsMainContent.tsx`

### Batch 2: UX Consistency (10 files)
3. **Standardize bottom padding** — replace `pb-16`/`pb-20` with `pb-bottom-nav md:pb-0` in the 9 key pages listed above
4. **Fix bokeh keyframe** in `index.css`

### Batch 3: Type Safety (1 file)
5. **Remove `as any`** from `ComposerBody.tsx` by extending `ComposerFormData`

### Batch 4: Security (Database)
6. **Investigate and fix** the 3 overly-permissive RLS policies and 1 mutable search_path function

---

## What's NOT Broken (Good News)
- Console.logs are clean (previous cleanup was thorough)
- No imports from `_archived/` directory
- Global overscroll-behavior is working
- Viewport meta tag is modern
- Feed, Composer (Share/Tell/Start modes), and core navigation are stable
- `dvh` migration was applied to the 10 most critical layout files already


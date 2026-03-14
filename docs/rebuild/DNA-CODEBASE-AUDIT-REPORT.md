# DNA Platform — Structured Codebase Audit Report
**Generated:** March 14, 2026  
**Methodology:** Routing → Mobile Layout → Page Completion → Dead Code/Broken Wiring

---

## 1. ROUTING AUDIT

### 1.1 Total Route Count: ~109 routes
- **Authenticated `/dna/*` routes:** ~55
- **Public marketing routes:** ~25
- **Admin routes:** ~15
- **Legacy redirect routes:** ~14

### 1.2 🔴 CRITICAL: `window.location.href` Instead of `navigate()`

These files use hard page reloads instead of React Router navigation, breaking SPA behavior (loses state, triggers full re-render):

| File | Line | Target | Severity |
|------|------|--------|----------|
| `src/components/connect/hub/DiscoveryFeed.tsx` | 281, 312, 350, 397 | Profile, Collaborate, Events, Contribute pages | 🔴 CRITICAL |
| `src/components/connect/hub/ConversationsPanel.tsx` | 448 | `/dna/messages` | 🔴 CRITICAL |
| `src/components/onboarding/FirstTimeWalkthrough.tsx` | 152 | `/dna/feed` | 🔴 CRITICAL |
| `src/components/BuildingTogetherSection.tsx` | 76 | `/about` | 🟡 MEDIUM |
| `src/components/mobile/MobileSettingsView.tsx` | 35 | `/` (after account delete) | 🟢 OK (intentional full reload) |
| `src/pages/PartnerWithDna.tsx` | 19 | Various | 🟡 MEDIUM |
| `src/pages/PartnerModels.tsx` | 14 | Various | 🟡 MEDIUM |
| `src/pages/PartnerStart.tsx` | 47, 74 | mailto + nav | 🟢 OK (mailto) |

**Fix:** Replace all `window.location.href` in authenticated components with `useNavigate()` calls.

### 1.3 ADA View State Remnants
- **Minimal residue.** Only `src/hooks/useLastViewState.ts` still references `viewState` — used for analytics tracking, not navigation. ✅ Not blocking.
- The `ViewStateProvider` wraps the app but view states are observation-only, not used for routing decisions.

### 1.4 Missing Back Navigation on Mobile
- All hub pages rely on browser back — no explicit "back" button in mobile headers for:
  - Event Detail (`/dna/convene/events/:id`)
  - Space Detail (`/dna/collaborate/spaces/:slug`)
  - Story Detail (`/dna/story/:slug`)
  - Profile View (`/dna/:username`)
  - Need Detail (`/dna/contribute/needs/:id`)
- The `MobileHeader` component supports `showBack` prop, but these pages don't use `MobileViewContainer`.

### 1.5 Legacy Route Redirects (Working ✅)
All legacy routes properly redirect:
- `/dna/me` → `/dna/feed`
- `/dna/impact` → `/dna/contribute`
- `/dna/events` → `/dna/convene/events`
- `/dna/discover` → `/dna/connect/discover`
- `/dna/connect/messages` → `/dna/messages`

---

## 2. MOBILE LAYOUT AUDIT

### 2.1 🔴 CRITICAL: Fixed-Width Containers
61 files use pixel-based widths. Key offenders in user-facing pages:

| Component | Issue | Risk |
|-----------|-------|------|
| `AlphaFeedbackForm.tsx` | `w-full sm:w-[420px]` | ✅ OK (mobile-first) |
| `ConveneEventPin.tsx` | `min-w-[200px] max-w-[260px]` | 🟡 Could overflow in narrow contexts |
| `SpaceDetail.tsx` (TabsList) | `min-w-[70px]` per tab × 5 tabs = 350px min | 🔴 Overflows on 320px screens |

### 2.2 Dialog vs. Drawer Inconsistency
These components use `<Dialog>` on ALL screen sizes when mobile should use `<Drawer>`:

| Component | Current | Should Be |
|-----------|---------|-----------|
| `EditPostDialog.tsx` | Dialog always | Drawer on mobile |
| `ReshareDialog.tsx` | Dialog always | Drawer on mobile |
| `CreateGroupDialog.tsx` | Dialog always | Drawer on mobile |
| `JoinBetaDialog.tsx` | Dialog always | Drawer on mobile |
| `RequestDemoDialog.tsx` | Dialog always | Drawer on mobile |

**Note:** The Universal Composer already correctly uses Drawer on mobile. These dialogs should follow the same pattern.

### 2.3 Touch Target Compliance
- `EnhancedMemberCard.tsx`: Dropdown trigger has `min-w-[32px] min-h-[32px]` — below 44px minimum. Has `sm:min-w-[36px]` but still under 44px.
- `PostConnectionNudgeCard.tsx`: Dismiss button `min-w-[28px] min-h-[28px]` — 🔴 below 44px.
- `ChatBubble.tsx`: Action buttons using `gap-0.5` with small targets.

### 2.4 Mobile Padding Consistency
The padding system is generally well-implemented:
- Feed: `pt-[7.5rem]` ✅
- Hubs: `pt-[6.5rem]` via BaseLayout ✅
- Bottom nav: `pb-bottom-nav` utility class ✅
- `overflow-x-hidden` applied at BaseLayout level ✅

---

## 3. PAGE COMPLETION AUDIT

### 3.1 COLLABORATE Module (70% Complete)

| Page | Live Data | Mock Data | Missing |
|------|-----------|-----------|---------|
| CollaborateHub | ✅ Real spaces query | — | DIA integration |
| SpacesIndex | ✅ Supabase query | — | Pagination |
| SpaceDetail | ✅ Real data | — | Activity feed wiring |
| TaskBoard | ✅ Real tasks | — | Drag-drop reorder |
| SpaceBoard | ✅ Real tasks | — | — |
| CreateSpace | ✅ Real mutation | — | Image upload |
| MySpaces | ✅ Real query | — | — |

**Verdict:** COLLABORATE is structurally complete. Main gaps are polish (drag-drop, pagination).

### 3.2 CONVEY Module (75% Complete)

| Page | Live Data | Mock Data | Missing |
|------|-----------|-----------|---------|
| ConveyHub | ✅ Real posts query | — | — |
| CreateStory | ✅ Real mutation | — | Rich text improvements |
| StoryDetail | ✅ Real data | — | — |
| FeedStoryDetail | ✅ Real data | — | — |

**Verdict:** CONVEY is functional. The editor could use enhancement but works.

### 3.3 CONTRIBUTE Module (60% Complete)

| Page | Live Data | Mock Data | Missing |
|------|-----------|-----------|---------|
| ContributeHub | ✅ Real needs query | — | Browse UI improvements |
| NeedsIndex | ✅ Real data | — | Filter/search |
| OpportunityDetail | ✅ Real data | — | Application flow |
| MyContributions | ✅ Real query | — | — |

**Verdict:** Functional but sparse UX. Needs filter/search and better browse experience.

### 3.4 Username/Profile Page
- `src/pages/dna/Username.tsx` line 66: **`// TODO: Replace with actual contributions table once it exists`** — returns empty array `[]`. Contributions section on profiles shows nothing.

---

## 4. DEAD CODE / BROKEN WIRING AUDIT

### 4.1 Active TODOs in User-Facing Code

| File | TODO | Impact |
|------|------|--------|
| `ProfileViewersWidget.tsx:141` | `/* TODO: Navigate to full analytics page */` | Button does nothing |
| `EventSettingsPage.tsx:173` | `// TODO: Send notifications to attendees` | Cancellation doesn't notify |
| `TeamManager.tsx:228` | `// TODO: Send notification to invited user` | Team invites silent |
| `Username.tsx:66` | `// TODO: Replace with actual contributions table` | Empty profile section |

### 4.2 Console Statements in Pages
- `src/pages/Waitlist.tsx:109` — `console.error` (acceptable for error logging)
- Pages are otherwise clean ✅

### 4.3 `_archived/` Directory
Contains ~20+ archived components that are properly excluded from routing but still in the bundle if imported anywhere:
- `DashboardCenterColumn.tsx` — still uses `window.location.href` (but archived)
- `MobileMessagingView.tsx` — has TODO for message sending (but archived)
- `ConnectionError.tsx` — uses `window.location.href` (but archived)

**Recommendation:** Verify no active imports from `_archived/`.

---

## 5. SEVERITY SUMMARY

### 🔴 CRITICAL (Fix Before Alpha Testing)

1. **DiscoveryFeed.tsx uses `window.location.href` for 4 navigation actions** — breaks SPA, loses state, causes full page reloads when users click recommendation cards
2. **ConversationsPanel.tsx uses `window.location.href`** — "View all messages" button causes full reload
3. **FirstTimeWalkthrough.tsx uses `window.location.href`** — post-onboarding redirect causes full reload
4. **SpaceDetail.tsx TabsList overflows on small screens** — 5 tabs × 70px min = 350px exceeds 320px viewport
5. **ProfileViewersWidget "View All" button does nothing** — onClick is empty

### 🟡 HIGH (Fix Before MVE)

6. **5 Dialog components should be Drawers on mobile** (EditPost, Reshare, CreateGroup, JoinBeta, RequestDemo)
7. **Touch targets under 44px** in EnhancedMemberCard, PostConnectionNudgeCard, ChatBubble
8. **No explicit back navigation** on Event Detail, Space Detail, Story Detail, Profile View, Need Detail mobile views
9. **Username.tsx contributions section returns empty array** — TODO still in place
10. **Event cancellation and team invites don't send notifications** — TODOs in management console

### 🟢 MEDIUM (Polish)

11. Partner pages use `window.location.href` (public marketing pages, less critical)
12. BuildingTogetherSection uses `window.location.href` for `/about` link
13. CONTRIBUTE hub needs filter/search UI
14. Verify no active imports from `_archived/` directory

---

## 6. RECOMMENDED FIX SEQUENCE

### Sprint 1: Navigation Integrity (1-2 days)
```
Fix #1-3: Replace window.location.href with navigate() in:
  - DiscoveryFeed.tsx (4 instances)
  - ConversationsPanel.tsx (1 instance)  
  - FirstTimeWalkthrough.tsx (1 instance)
Fix #5: Wire ProfileViewersWidget button to /dna/analytics
```

### Sprint 2: Mobile Layout Fixes (1-2 days)
```
Fix #4: SpaceDetail TabsList — use horizontal scroll or dropdown on mobile
Fix #6: Convert 5 Dialogs to responsive Dialog/Drawer pattern
Fix #7: Increase touch targets to 44px minimum
Fix #8: Add back navigation to detail pages on mobile
```

### Sprint 3: Data Wiring (1-2 days)
```
Fix #9: Wire contributions section on profile pages
Fix #10: Implement notification sending for event cancellation + team invites
Fix #13: Add filter/search to Contribute hub
```

---

## 7. FEATURE COMPLETION CHECKLIST (Use For Every Feature)

```
[ ] Works on 375px mobile width
[ ] All buttons trigger navigate() or defined actions (not state-only or window.location)
[ ] Back navigation works predictably on mobile
[ ] Real data renders (not mock/empty state only)
[ ] DIA layer present or intentionally deferred
[ ] No TypeScript errors in this file
[ ] No TODO comments in user-facing interaction paths
[ ] Touch targets ≥ 44px
[ ] Dialogs use Drawer on mobile
[ ] Tested by tapping through on actual mobile viewport
```

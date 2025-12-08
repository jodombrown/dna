# DNA Profile & Onboarding Execution Plan

This document captures the current status and the next three implementation prompts to align DNA around Profile and Onboarding. It is distilled from the latest Lovable diagnostic so the prompts can be executed directly.

## Current State (Signal)
- **Stable enough for beta**
  - **Feed (Posts) ~85%** – posts render, tabs work, pagination/RPC stable; remaining work is optional polish (views, share counts, etc.).
  - **Stories/Convey ~75%** – composer + hub working; detail page missing UX polish (bookmarks, related stories, categories).
  - **Navigation & DB layer 85–90%** – app shell consistent, canonical `get_universal_feed` RPC fixed, RLS solid.
- **Not OK (blockers)**
  - **Profile ~60% (RED)** – legacy PublicProfile vs ProfileV2 both present; edit profile unwired; activity placeholder; identity feels untrustworthy.
  - **Onboarding ~55% (RED)** – competing flows (WelcomeWizard vs 12-step); no single documented path from signup → profile → first actions.
- **Yellow but non-blocking** – Connect (~70%), Composer (~75%), Mobile UX (~80%; profile needs polish).

## Phase Plan (High Level)
1. **Make me feel seen** – Canonical ProfileV2, editable profile, Me Drawer, pick onboarding path.
2. **Make my actions coherent** – Verify composer modes create/link correct entities; polish story detail (bookmark, comments status, related stories).
3. **Make my network meaningful** – Cleanup Connect routes/redirects, improve recommendations, add simple growth surfaces.

## Prompt 1 — Canonicalize Profile + Me Drawer v1.0
**Title:** DNA | Profile v2 + Me Drawer – Canonical Edit Flow v1.0

Implement ProfileV2 as the single profile system, wire real edit profile UX, and add a right-side Me Drawer.

- Canonicalize Profile
  - Make ProfileV2 the implementation at `/dna/:username`.
  - Migrate/disable remaining PublicProfile usage; keep `rpc_get_profile_bundle` aligned to ProfileV2 fields.
- Real Edit Profile Flow
  - Desktop: modal/side panel with Basic Info, About, Skills + Open To; Mobile: full-screen sheet.
  - Hook fields to profile update RPCs; on save close editor, refresh data, show success toast; enforce RLS to update own profile only.
- Me Drawer (avatar click → right slide-in)
  - Show avatar, name, headline, location; quick links to Profile, Settings, Saved, My Stories, My Posts, Sign out.
  - Polish spacing/typography for mobile.
- ProfileV2 UX polish (mobile-first) – hero card spacing, padding, font sizing; premium feel.
- **Checklist for validation**
  - [ ] Edit profile saves and reflects changes.
  - [ ] Avatar opens Me Drawer with working links on mobile/desktop.
  - [ ] No active routes still using legacy PublicProfile.

## Prompt 2 — Canonical Onboarding Flow v2.0
**Title:** DNA | Onboarding v2 – Canonical Flow + Profile Integration

Choose one onboarding path, wire it into ProfileV2, and ensure routing guards.

- Decide/implement single onboarding flow (short WelcomeWizard vs guided stepper) and disable the other.
- On completion, create/update ProfileV2 with name/headline, location/origin, skills, Open To; update profile completion score; redirect to `/dna/feed` or `/dna/:username` with nudge.
- Mobile UX: no pinch-zoom/broken width; clear Next/Back and progress indicator.
- Guards: new users forced into onboarding; returning users skip directly to feed.
- **Checklist**
  - [ ] New user follows canonical steps and lands in expected destination.
  - [ ] Returning user bypasses onboarding.
  - [ ] Mobile rendering intact.

## Prompt 3 — Composer Entity Creation Verification
**Title:** DNA | Composer – Entity Creation & Linking Audit

Audit and fix Universal Composer modes (post, story, event, space, need, community).

- Map current behavior: tables written, feed entries created, linking fields.
- Fix event/space/need creation so each writes correct entity + linked feed post; ensure RLS permits creator access.
- UX feedback: success toast per mode and logical redirect (event detail, space page, needs list/detail, feed/story detail).
- **Deliverable matrix**: Mode → Entity table → Post created? → Linked by field → Redirect path.

## How to Validate Each Phase
- **After Prompt 1:** Avatar opens Me Drawer; drawer links; edit profile works and updates immediately.
- **After Prompt 2:** New user flows through chosen steps, lands on feed/profile; profile shows entered info; login again skips onboarding.
- **After Prompt 3:** Creating post/story/event/space/need shows in feed and routes to meaningful detail with correct toast.

# DNA | CONNECT v2 – Ship & Iterate Tickets

This document contains focused tickets separating **Ship Now** (pre-launch verification) from **v2.1** (post-launch improvements based on user behavior).

---

## 🚢 SHIP NOW (Pre-Launch Verification)

These tickets are **verification-only**—confirming existing functionality works as expected before declaring CONNECT v2 live.

---

### Ticket #1: Staging Verification – Feed as Home & Empty State

**Type:** QA/Verification  
**Priority:** P0 (Ship Blocker)  
**Estimate:** 10 minutes

**Objective:**  
Verify that `/dna/feed` is the default landing route and that the empty state works correctly for new users.

**Acceptance Criteria:**

1. **Login Landing:**
   - [ ] Log in with a normal user → lands on `/dna/feed`
   - [ ] "Home" or "Feed" tab is highlighted in main navigation
   - [ ] No console errors on landing

2. **Empty Feed (New User):**
   - [ ] Use a fresh account with: no connections, no spaces, no events
   - [ ] Feed shows empty state card (not a blank page)
   - [ ] Empty state includes:
     - [ ] "Discover Members" button → `/dna/connect/discover`
     - [ ] "Explore Spaces" button → spaces list route
     - [ ] "Browse Events" button → events list route
   - [ ] All buttons navigate correctly (no 404s)

3. **Active Feed (Seeded User):**
   - [ ] Use account with connections, spaces, events, contributions
   - [ ] Feed shows at least 2-3 different card types:
     - [ ] Connection activity
     - [ ] Space activity
     - [ ] Event activity
     - [ ] Posts/stories
   - [ ] Each card type deep-links correctly into the right C

**How to Test:**
- Staging environment
- Two test accounts: one fresh (no activity), one seeded (rich activity)

**Done When:**
All checkboxes are ✅ with no major bugs or broken links.

---

### Ticket #2: Staging Verification – Profile Gate & Safety (40%)

**Type:** QA/Verification  
**Priority:** P0 (Ship Blocker)  
**Estimate:** 15 minutes

**Objective:**  
Verify that the 40% profile completion gate and blocking mechanisms work correctly across Discover, Network, and connection requests.

**Acceptance Criteria:**

1. **Profile Gate Enforcement:**
   - [ ] Account A: profile completion < 40%
     - [ ] Does NOT appear in `/dna/connect/discover` results
     - [ ] When Account A clicks "Connect" on someone: receives "complete profile to 40%" error/toast
     - [ ] Error prevents request from being sent
   - [ ] Account B: profile completion ≥ 40%
     - [ ] DOES appear in Discover results
     - [ ] CAN send connection requests successfully

2. **Profile Strength Banner:**
   - [ ] With a user < 40% profile:
     - [ ] Banner appears on `/dna/feed`
     - [ ] Banner appears on `/dna/me`
     - [ ] Banner appears on `/dna/connect/discover`
     - [ ] "Complete Profile" button → `/app/profile/edit`
     - [ ] Dismiss works and persists across refresh (if implemented)

3. **Blocking Safety:**
   - [ ] User A blocks User B
   - [ ] User B disappears from:
     - [ ] `/dna/connect/discover` (for User A)
     - [ ] `/dna/feed` (for User A)
     - [ ] Network suggestions (for User A)
   - [ ] Connect/Message CTAs no longer available on User B's profile (when viewed by User A)
   - [ ] Unblock restores visibility

**How to Test:**
- Two test accounts: one <40%, one ≥40%
- Test blocking with both accounts

**Done When:**
All safety and gating mechanisms function as expected with no bypasses.

---

### Ticket #3: Staging Verification – Cross-5C Profile Links

**Type:** QA/Verification  
**Priority:** P0 (Ship Blocker)  
**Estimate:** 10 minutes

**Objective:**  
Verify that public profiles (`/dna/:username`) correctly display and link to Spaces, Events, Contributions, and Stories.

**Acceptance Criteria:**

From `/dna/:username` with a well-connected test user:

1. **Spaces Section:**
   - [ ] Shows spaces the user is a member of
   - [ ] Clicking a space card → opens valid `/dna/collaborate/spaces/:id` route
   - [ ] No 404s or broken links

2. **Events Section:**
   - [ ] Shows events the user attends/hosts
   - [ ] Clicking an event card → opens `/dna/convene/events/:id`
   - [ ] No 404s or broken links

3. **Contributions Section:**
   - [ ] Shows contribution needs/offers (if user has any)
   - [ ] Clicking a contribution → opens valid CONTRIBUTE route
   - [ ] No 404s or broken links

4. **Stories Section:**
   - [ ] Shows published stories/highlights
   - [ ] Clicking a story card → opens `/dna/convey/:id` or similar
   - [ ] No 404s or broken links

**How to Test:**
- Use a seeded account with activity across all 5Cs
- Click through each section on their public profile

**Done When:**
All cross-5C sections render correctly and deep-link to the right pillar without errors.

---

### Ticket #4: Production Smoke Test – Core CONNECT Flows

**Type:** QA/Verification  
**Priority:** P0 (Ship Blocker)  
**Estimate:** 5 minutes

**Objective:**  
After deploying to production, run a quick smoke test to confirm core CONNECT flows work.

**Acceptance Criteria:**

1. **Feed:**
   - [ ] Log in → lands on `/dna/feed`
   - [ ] No console errors
   - [ ] At least one activity card renders (or empty state if new user)

2. **Discover:**
   - [ ] Navigate to `/dna/connect/discover`
   - [ ] Filters load and apply correctly
   - [ ] Member cards show "Shared: X · Y · Z" when applicable
   - [ ] Connection requests work (if profile ≥ 40%)

3. **Profile:**
   - [ ] Navigate to `/dna/:username` (your own or test account)
   - [ ] Cross-5C sections visible
   - [ ] No 404s when clicking into spaces/events/contributions/stories

**How to Test:**
- Your own production account + one test account
- Quick 5-minute walkthrough

**Done When:**
No critical errors, 404s, or broken flows in production.

---

## 🚀 v2.1 (Post-Launch Improvements)

These tickets are **post-launch enhancements** based on real user behavior. Do NOT implement before shipping v2.

---

### Ticket #5: Filter-Aware Empty States on Feed

**Type:** Enhancement  
**Priority:** P2 (Post-Launch)  
**Estimate:** 2 hours

**Objective:**  
Improve Feed empty state clarity by showing context-specific messages based on what type of activity is missing.

**User Story:**  
As a user with some activity but not all types, I want to understand what's missing so I know how to enrich my Feed.

**Current State:**  
Generic "No activity yet" message even when user has connections but no space/event activity.

**Proposed Change:**

Instead of one generic empty state, show:
- "No posts yet—share something or connect with others to see updates here"
- "No space activity yet—join a collaboration space to see updates"
- "No event activity yet—register for an event to stay in the loop"

**Implementation Notes:**
- Check `activityFeed` data to determine which types are missing
- Render contextual empty state based on gaps
- Keep CTAs consistent (Discover Members, Explore Spaces, Browse Events)

**Acceptance Criteria:**
- [ ] Empty state message reflects what's missing
- [ ] CTAs still work correctly
- [ ] No regression on full empty state (brand new user with nothing)

**Done When:**
Empty states are context-aware and guide users toward specific actions.

---

### Ticket #6: Suggested Widgets on `/dna/me`

**Type:** Feature  
**Priority:** P2 (Post-Launch)  
**Estimate:** 8 hours

**Objective:**  
Add intelligent recommendation widgets to My DNA Hub to help users discover relevant connections, spaces, events, and needs.

**User Story:**  
As a user on `/dna/me`, I want to see suggested connections, spaces, and events based on my profile so I can quickly engage with relevant opportunities.

**Proposed Widgets:**

1. **Suggested Connections** (3-5 cards)
   - Match based on: focus areas, industries, regional expertise, skills
   - Show "Shared: X · Y · Z" context
   - CTA: "Connect"

2. **Suggested Spaces** (2-3 cards)
   - Match based on: focus areas, industries, tags
   - Show member count, description snippet
   - CTA: "Join Space"

3. **Suggested Events** (2-3 cards)
   - Upcoming events matching: focus areas, location, interests
   - Show date, location, attendee count
   - CTA: "Register"

4. **Recommended Needs** (2-3 cards)
   - Contribution needs matching: skills offered, focus areas, region
   - Show need type, priority, space/project
   - CTA: "Support This"

**Implementation Notes:**
- Use existing `discover_members` logic for connection suggestions
- Create new RPCs or client-side filtering for spaces/events/needs
- Limit to 2-5 items per widget to avoid overwhelming UI
- Add empty states if no suggestions available

**Acceptance Criteria:**
- [ ] All four widget types render on `/dna/me`
- [ ] Suggestions are relevant (match user profile attributes)
- [ ] CTAs navigate correctly
- [ ] Performance: widgets load within 2 seconds

**Done When:**
My DNA Hub includes personalized suggestions across all 4 recommendation types.

---

### Ticket #7: High-Signal Analytics Events

**Type:** Instrumentation  
**Priority:** P2 (Post-Launch)  
**Estimate:** 3 hours

**Objective:**  
Add analytics tracking for key user interactions in CONNECT v2 to measure engagement and identify optimization opportunities.

**User Story:**  
As a product team, we want to understand how users engage with Feed, Discover, and cross-5C flows so we can prioritize v2.2 improvements.

**Events to Track:**

1. **Feed Interactions:**
   - `feed_empty_state_cta_click` – which CTA clicked (discover/spaces/events)
   - `feed_activity_card_click` – which card type (connection/space/event/contribution/story)
   - `feed_cross_c_navigation` – which C pillar navigated to

2. **Discover Interactions:**
   - `discover_filter_applied` – which filters used (focus_areas/industries/regions/skills)
   - `discover_member_card_click` – member profile clicked
   - `discover_shared_attribute_visible` – "Shared: X" displayed (track overlap type)

3. **Profile Cross-5C:**
   - `profile_space_click` – user clicked into a space from profile
   - `profile_event_click` – user clicked into an event from profile
   - `profile_contribution_click` – user clicked into a contribution from profile
   - `profile_story_click` – user clicked into a story from profile

4. **Profile Gate:**
   - `profile_gate_blocked` – user tried to connect but was blocked by <40% gate
   - `profile_banner_cta_click` – user clicked "Complete Profile" from banner

**Implementation Notes:**
- Use existing `analytics_events` table
- Add tracking to:
  - Feed components (`FeedEmptyState`, activity cards)
  - Discover page (`MemberCard`, filter controls)
  - Profile cross-5C sections
  - Profile strength banner
- Include relevant metadata (e.g., which filter, which C pillar)

**Acceptance Criteria:**
- [ ] All listed events fire correctly
- [ ] Events include relevant metadata
- [ ] No performance impact (async tracking)
- [ ] Can query events in Supabase dashboard

**Done When:**
All high-signal CONNECT v2 interactions are tracked and queryable.

---

## 📋 Summary

### Ship Now (Tickets #1-4)
- **#1:** Feed home & empty state verification
- **#2:** Profile gate & safety verification
- **#3:** Cross-5C profile links verification
- **#4:** Production smoke test

**Total Effort:** ~40 minutes of focused verification

---

### v2.1 (Tickets #5-7)
- **#5:** Filter-aware empty states on Feed (~2 hours)
- **#6:** Suggested widgets on `/dna/me` (~8 hours)
- **#7:** High-signal analytics events (~3 hours)

**Total Effort:** ~13 hours (post-launch, behavior-driven)

---

## 🎯 Next Steps

1. **Now:** Run Tickets #1-3 in staging
2. **After staging ✅:** Deploy to production
3. **After production deploy:** Run Ticket #4
4. **After real users touch it:** Observe behavior, then prioritize Tickets #5-7 based on what you learn

---

**CONNECT v2 is ready to ship. The learning comes from watching real users move through Feed → Discover → Profile → cross-5C flows.**

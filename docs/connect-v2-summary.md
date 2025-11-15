# DNA | CONNECT v2 – Engine-Ready Summary

**Role in the 5C Engine**

CONNECT is now the **primary network layer** of DNA and a true entry into the engine loop:

> Feed (multi-C activity) → Connect (people) → Convene (events/spaces) → Collaborate (projects) → Contribute (needs/offers) → Convey (stories) → back into Feed.

It's no longer "just a people directory." It's where the **network, activity, and opportunities intersect**.

---

## 1. Core Surfaces

### a) **Multi-C Feed – `/dna/feed` (Home)**

* Acts as the **default logged-in home** (no more auto-redirect to Discover).
* Shows a **mixed activity stream**:
  * Posts from connections
  * Connection activity
  * Space & event activity
  * Contributions (needs/offers/validations)
  * Stories / CONVEY highlights
* Filter bar (example):
  * All activity / Posts / Connections / Spaces & Events / Contributions & Stories
* Every card **deep-links into another C**:
  * Profiles → CONNECT
  * Spaces/projects → COLLABORATE
  * Events → CONVENE
  * Needs/offers → CONTRIBUTE
  * Stories → CONVEY
* Respects **blocked users** across the activity feed.

**What this gives you:** a real "engine home" instead of five disconnected modules.

---

### b) **Discover & Network – `/dna/connect/discover` & `/dna/connect/network`**

**Discover (/dna/connect/discover):**

* Canonical Discover route (legacy `/dna/discover` aligns/redirects to this).
* Filters wired into `discover_members` RPC:
  * Focus areas, industries, skills
  * Country of origin, current country
  * Regional expertise
  * Text search against name/headline/bio/profession
* Pagination with **Load More** (backed by `p_limit/p_offset` in RPC).
* MemberCard:
  * Shows match score, key tags, location.
  * Connection state machine:
    * Stranger → "Connect"
    * Pending sent → "Request Sent"
    * Pending received → "Request Received" (link to Network/Requests)
    * Accepted → "Message" + "Profile"
* **Profile gate enforced in RPC**:
  * Only profiles with `profile_completion_percentage ≥ 40` appear.
* **Blocked users filtered** both ways at the RPC level.

**Network (/dna/connect/network):**

* Tabs for:
  * Requests (incoming)
  * Connections
  * Suggestions
* Accept/decline changes state correctly.
* "Message" opens conversation in `/dna/connect/messages`.

**What this gives you:** a focused "find & manage people" layer, with real safety and a quality bar.

---

### c) **My DNA Hub – `/dna/me`**

* Shows:
  * Profile strength + "Complete your profile" CTA.
  * Suggested connections.
  * Upcoming events.
  * Active spaces.
  * Contributions summary.
* Now includes:
  * **"View My Public Profile" → `/dna/:username`**
  * **"Edit Profile" → `/app/profile/edit`**

**What this gives you:** a personal cockpit that nudges users toward being "engine-ready" (≥40%, networked, plugged into spaces/events).

---

### d) **Public Profiles – `/dna/:username`**

Profiles now act as **nodes in the whole engine**, not just a bio page:

* Identity: name, headline, diaspora story, location, skills, focus areas.
* Cross-5C sections (where data exists):
  * **Spaces** the user is part of → COLLABORATE.
  * **Events** they host/attend → CONVENE.
  * **Contributions** (needs/offers/validations) → CONTRIBUTE.
  * **Stories & Highlights** they authored/are tied to → CONVEY.
* CTAs / Safety:
  * Connect / Message (based on connection state).
  * Block/Report (ties into existing moderation + blocked_users).

**What this gives you:** from any person, you can see how they're **embedded in the engine** and act on it.

---

### e) **Safety, Gatekeeping & Nudges**

* **Profile gate**:
  * `discover_members` excludes users below 40% completion.
  * `send-connection-request` returns `profile_incomplete` for <40%:
    * UI shows a clear toast: "Complete your profile to at least 40% to send connection requests."
* **Blocking**:
  * `blocked_users` enforced in:
    * Discover
    * Feed (multi-C activity)
    * Suggestions
  * Connect/Message CTAs hidden where block exists.
* **ADIN-lite** (rule-based, not heavy ML yet):
  * Nudges for:
    * Zero connections after some days
    * Inactivity
    * Profile completion prompts
  * Surfaced on `/dna/me` via ConnectNudges.

---

## 2. What CONNECT v2 Now Enables (Behaviorally)

For a typical member:

* They **land on Feed**, see:
  * who's active in their world,
  * what spaces/events/contributions are live,
  * and stories that matter.
* They **Discover** people with real filters (heritage, skills, regions, focus areas).
* They can **Connect + Message** with a clean state machine and safety.
* They can click into someone's profile and see:
  * where they gather (spaces/events),
  * what they're building (projects),
  * how they give/need help (contributions),
  * and what they're saying (stories).

That's a mobilization engine, not just a directory.

---

## 3. Known "Next Layer" (Post-v2)

You're ready to treat these as **v2.5 / v3**:

* More intelligent ranking in Feed (beyond chronological).
* Saved searches + discovery preferences ("people like X", "people in my spaces").
* Richer ADIN intelligence layer (smart nudges, recommended spaces/events).
* Better event/space visibility from profiles (e.g., "join them in X space").

---

## Technical Implementation Notes

### Key Database Functions
- `discover_members`: Enforces 40% profile gate, blocks, match scoring
- `send-connection-request` edge function: Validates profile completion, rate limits, blocks

### Connection States (TypeScript)
```typescript
type ConnectionStatus = 
  | 'none' 
  | 'pending_sent' 
  | 'pending_received' 
  | 'accepted' 
  | 'declined' 
  | 'blocked';
```

### Profile Completion Calculation
- Stored in `profiles.profile_completion_percentage`
- Auto-calculated via trigger on profile updates
- Minimum 40% required for:
  - Appearing in Discover
  - Sending connection requests
  - Participating in certain spaces/events

### Safety Layers
1. **Profile Gate**: RPC-level filtering + edge function validation
2. **Blocking**: Bidirectional filtering in all discovery surfaces
3. **Rate Limiting**: 20 connection requests per hour
4. **Authentication**: All CONNECT surfaces require auth

---

**Status**: ✅ Engine-ready. Ready for production smoke testing and user onboarding.

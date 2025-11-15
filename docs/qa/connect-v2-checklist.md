# DNA | CONNECT v2 – Sign-off Checklist

Use this as your "we don't ship until all are ✅" list.

---

## Quick Links

- **[CONNECT v2 Summary](../connect-v2-summary.md)** - One-pager explaining what CONNECT v2 is and what it enables
- **[Smoke Test Script](connect-v2-smoke-test.md)** - 10-step quick verification after deployment

---

## A. Home & Entry (Engine Feel)

### 1. Feed is the home base
- [ ] After login, user lands on `/dna/feed` (or `/dna/home` alias), not Discover.
- [ ] `/dna/feed` shows **multi-C activity**, not just posts.
- [ ] Main nav clearly signals Feed/Home as "where to start."

### 2. No competing homes
- [ ] `/dna/me` clearly looks like a **hub about me**, not a second homepage.
- [ ] `/dna/connect` clearly feels like **"People & Network"**, not a home.

---

## B. Multi-C Feed

### 3. Card diversity
- [ ] In real data, you can see at least **3 different activity types** (e.g., posts + connections + events/spaces/contributions/stories).
- [ ] Each card shows who/what/when and a clear CTA.

### 4. Deep links into 5Cs
- [ ] Every card type deep-links correctly:
  - Profiles → `/dna/:username`
  - Spaces → space detail
  - Events → event detail
  - Contributions → contribute detail
  - Stories → convey detail

### 5. Filters & safety
- [ ] Feed filters (All / Posts / Connections / Spaces & Events / Contributions & Stories) actually change the content.
- [ ] Activities from **blocked users never appear** in the feed.

---

## C. Discover & Network

### 6. Discover v2 behavior
- [ ] `/dna/connect/discover` is the **canonical** Discover; `/dna/discover` routes/redirects into it.
- [ ] Filters work: focus areas, industries, skills, origin country, current country, regional expertise.
- [ ] Search bar filters by name/headline/bio.
- [ ] "Load More" appends results, keeps filters.

### 7. Profile gate & blocking
- [ ] Users with < 40% profile completion **do not appear** in Discover.
- [ ] Blocked users (both directions) **never appear** in Discover or suggestions.
- [ ] A user with < 40% sees a clear message if they try to send a connection request.

### 8. Network page behavior
- [ ] `/dna/connect/network` shows Requests / Connections / Suggestions clearly.
- [ ] Accept/Decline moves a request into the right state.
- [ ] "Message" from a connection opens or creates a conversation in `/dna/connect/messages`.

---

## D. MemberCard / Connection States

### 9. MemberCard state machine
- [ ] For a stranger: "Connect" button visible.
- [ ] After sending a request: card shows "Request sent" (no duplicate sending).
- [ ] If you received a request from them: card shows "Request Received" with link to Network/Requests.
- [ ] Once connected (after accepted): card shows "Message" + "Profile".
- [ ] No TypeScript errors, and connection state matches the backend reality.

---

## E. My DNA & Profile (Cross-5C Node)

### 10. /dna/me – My DNA hub
- [ ] Shows profile strength + clear "Complete profile" CTA.
- [ ] Has **"View my public profile"** (→ `/dna/:username`) and **"Edit profile"** (→ `/app/profile/edit`).
- [ ] Shows modules for Suggested Connections, Events, Spaces, Contributions (even if some are empty).

### 11. /dna/:username – Engine node, not just bio
- [ ] Profile shows cross-5C sections:
  - Spaces this person is in.
  - Events they host/attend (as appropriate).
  - Contributions (needs/offers/validations).
  - Stories & highlights.
- [ ] Every section item deep-links into the right C.

---

## F. Safety & Cross-5C Flows

### 12. Blocking works everywhere
- [ ] Blocking someone removes them from Discover, Feed, Suggestions, Network actions.
- [ ] Connect/Message CTAs disappear on their profile.
- [ ] Attempts to connect/message a blocked user fail gracefully with a clear error.

### 13. Connect → Convene/Collaborate/Contribute/Convey
- [ ] From a **profile**, you can reach:
  - Spaces → Collaborate.
  - Events → Convene.
  - Contributions → Contribute.
  - Stories → Convey.
- [ ] From **feed cards**, you can click into at least 2 other Cs in 2 clicks or fewer.

---

## Testing Guide

### Profile Gate Testing

**Create test user with < 40% completion:**
1. Create a new account
2. Fill only username and full_name (should be < 40%)
3. Log in as another user
4. Go to `/dna/connect/discover`
5. ✅ Low-completion user should NOT appear in results
6. Try to send connection request from low-completion account
7. ✅ Should see toast: "Complete your profile to at least 40% to send connection requests"
8. ✅ Should navigate to `/app/profile/edit`

**Complete profile above 40%:**
1. Add headline, bio, focus areas, location
2. Profile should now be >= 40%
3. Log in as another user and search
4. ✅ User should now appear in Discover
5. ✅ Can send connection requests

### MemberCard State Testing

**Test all connection states:**
1. **None/Stranger state:**
   - Find someone you're not connected to
   - ✅ Should see "Connect" and "Profile" buttons
   
2. **Pending Sent state:**
   - Send a connection request
   - ✅ Card should update to show "Request Sent" (disabled) and "Profile"
   - ✅ No duplicate requests possible
   
3. **Pending Received state:**
   - Have someone send you a request
   - View their card
   - ✅ Should show "Request Received" button linking to Network/Requests
   - ✅ Should show "Profile" button
   
4. **Accepted/Connected state:**
   - Accept a connection
   - View their card
   - ✅ Should show "Message" and "Profile" buttons
   - ✅ "Message" opens conversation in `/dna/connect/messages`

### Blocking Testing

**Test blocking in all contexts:**
1. Block a user from their profile
2. Check they're removed from:
   - ✅ `/dna/connect/discover` results
   - ✅ `/dna/feed` (no activities shown)
   - ✅ Suggestions in `/dna/connect/network`
3. Try to message or connect with blocked user
4. ✅ Should fail gracefully with clear error

---

When all 13 checklist items are ✅, CONNECT is engine-ready!

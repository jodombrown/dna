# DNA Codebase Bug Audit — 2026-08-07

**Auditor:** Claude Code (Sonnet 5), 7-way parallel read-only audit
**Scope:** `jodombrown/dna-May-2026` working tree as of `4d8bdf6` (main)
**Method:** Seven independent agents each audited one subsystem — auth/context, data hooks & services, Supabase edge functions, Supabase migrations & RLS, core UI components, pages/routing/layouts, and shared lib/utils. This document consolidates their verified findings, ordered by severity, with duplicates merged and every item cross-checked against actual call sites (not just the defining function) to confirm it's reachable in the shipped app.

**Note:** This audit is functional/security-only. It does not evaluate the design-system rules in `CLAUDE.md` (raw colors, arbitrary Tailwind values, etc.) — that is a separate concern.

---

## Executive summary

| Severity | Count |
|---|---|
| Critical | 4 |
| High | 12 |
| Medium | 11 |
| Low | 6 |

**Update (2026-08-07, same day):** Every Critical, High, Medium, and Low finding in this report is now fixed on this branch (M1 verified as not requiring a fix — see its note) — see the "Status" note under each.

Two findings stand out as needing immediate attention:

1. **A systemic IDOR vulnerability** lets any authenticated user read another user's private messages, notifications, drafts, and profile-viewer lists by passing that user's UUID (which is exposed all over the public API) into several `SECURITY DEFINER` RPCs.
2. **The "Manage event" button is broken in production** for organizers — it sends them to the homepage instead of the event console, in three separate live UI locations.

---

## Critical

### C1. IDOR: private-data RPCs trust a caller-supplied user ID instead of `auth.uid()`
**Root cause:** `supabase/migrations/20250809005352_87812aed-30bb-4a0b-a758-ce6aac64b2d3.sql:3-9` — `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;` plus `ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ON FUNCTIONS TO anon, authenticated;` makes every `public` schema function (present and future) callable via `/rpc/<name>` unless individually revoked.

Combined with `SECURITY DEFINER` functions (which bypass RLS, running as the owner) that accept a `p_user_id`/`target_user_id` parameter and use it as the *sole* trust boundary — never checking it against `auth.uid()` — this is a live, exploitable IDOR:

| Function | File | Leaks |
|---|---|---|
| `get_user_conversations(p_user_id, …)` | `20251215201553_9208909e-8083-4cc3-bb02-76c739a90aba.sql` | Any user's full conversation list |
| `get_conversation_messages(p_conversation_id, p_user_id, …)` | `20251210050218_236c225a-638c-4a2b-b1db-7b42c7f95299.sql:4-51` | Full private DM content |
| `get_conversation_details(p_conversation_id, p_user_id)` | `20251210162529_6d117869-776e-41a0-8f9c-2d07725616d9.sql:13-52` | Conversation metadata |
| `get_message_requests(p_user_id, …)` | `20251209180630_dna_messaging_system.sql:596-651` | Pending message-request previews |
| `get_user_notifications(p_user_id, …)` | `20260716145635_n2_notifications_read_canonical.sql:23-87` (current) | Any user's private notification feed |
| `get_blocked_users(p_user_id)` | `20251105104827_75320c80-5a1e-4303-a88c-8575a7fae5d3.sql:146-175` | Block list |
| `get_profile_viewers(p_profile_id, …)` | `20251105104030_673a1bd0-6a3f-4d0a-bbdc-0ff9074c8d56.sql:2-46` | "Who viewed my profile" |
| `get_user_drafts(p_user_id, …)` | `20251207002000_add_draft_posts.sql:59-92` | Unpublished draft posts |

**Exploit:** `POST /rest/v1/rpc/get_conversation_messages` with `{"p_conversation_id": "<known>", "p_user_id": "<victim-uuid>"}` returns the victim's private thread. Victim UUIDs are not secret — they appear as author IDs on posts/comments and in profile URLs.

**Fix:** Add `IF p_user_id <> auth.uid() THEN RAISE EXCEPTION 'not authorized'; END IF;` to every one of these (or drop the parameter and use `auth.uid()` internally). Revisit the blanket `GRANT EXECUTE ... TO anon, authenticated` so new `SECURITY DEFINER` functions aren't world-callable by default. Reference the codebase's own correct pattern in `20260729073239_location_columns_owner_only.sql` (`get_own_location()`, no parameter) and `remove_connection()` in `20251105104827_...sql` (explicit `auth.uid()` check).

**Status: Fixed** in `supabase/migrations/20260807120000_fix_idor_user_scoped_rpcs.sql`. All 8 functions listed in the table above now reject the call with `RAISE EXCEPTION` unless the identifying parameter (`p_user_id`, or `p_profile_id` for `get_profile_viewers`) matches `auth.uid()`. Verified every live client call site (`get_user_conversations`, `get_blocked_users`, `get_user_notifications`) already passes the caller's own ID, so this is non-breaking for legitimate use. The blanket `GRANT EXECUTE ... TO anon, authenticated` / `ALTER DEFAULT PRIVILEGES` in `20250809005352_...sql` is unchanged — still worth a follow-up decision on whether newly-added `SECURITY DEFINER` functions should be world-callable by default, but out of scope for this fix (it's additive policy, not a fix to a specific bug).

### C2. "Manage event" navigates organizers to the homepage instead of the event console
**Files:** `src/App.tsx:612-618` (route defs); live callers: `src/components/convene/EventOverview.tsx:527`, `src/components/convene/StickyRSVPBar.tsx:106`, `src/components/feed/cards/EventCard.tsx:271`

The `/manage*` redirect routes are declared as flat siblings of `/dna/convene/events/:id`, not nested as children:
```tsx
<Route path="/dna/convene/events/:id/manage" element={<Navigate to=".." replace />} />
<Route path="/dna/convene/events/:id/manage/attendees" element={<Navigate to="../attendees" replace />} />
```
React Router resolves relative `".."` against route-tree nesting depth, not URL segments. Since these routes aren't nested, `".."` resolves to `/` (site root) instead of the parent event route, and `"../attendees"` resolves to the non-existent `/attendees` → 404.

**Impact:** Three separate, currently-shipping "Manage" CTAs (event overview page, sticky RSVP bar, feed event card) send organizers to the homepage or a 404 instead of the management console.

**Fix:** Nest these routes as children of `/dna/convene/events/:id`, or replace the bare `<Navigate to=".."/>` with a small redirect component (mirroring the existing, correct `EventSettingsRedirect`) that reads `useParams().id` and navigates to the absolute path.

**Status: Fixed** in `src/components/routing/LegacyEventManageRedirect.tsx` (wired into `src/App.tsx`), following the `EventSettingsRedirect` pattern this file already recommended. Each `/manage*` route now renders `<LegacyEventManageRedirect to="...">`, which reads `useParams().id` and navigates to the absolute `/dna/convene/events/:id[/sub-path]`, sidestepping the relative-path depth issue entirely. Confirmed all three live callers (`EventOverview.tsx:527`, `StickyRSVPBar.tsx:106`, `EventCard.tsx:271`) target the base `/manage` route, which now correctly lands on the event overview instead of the site root.

### C3. Infinite render loop crashes any group chat thread with prior messages
**File:** `src/hooks/useRealtimeMessaging.ts:83-109`

`messages` is computed via an IIFE that runs on every render (not memoized) and unconditionally calls `setOptimisticMessages(prev => prev.filter(...))` whenever `confirmedClientIds.size > 0` — true for essentially every real conversation, since every sent message carries a `client_id`. `.filter()` always returns a new array reference even when nothing changes, so this fires a state update on every render → re-render → repeat.

**Failure scenario:** Opening any group thread (`GroupThreadView.tsx`) with ≥1 prior message throws React's "Too many re-renders" error, crashing the view.

**Fix:** Move the pruning into a `useEffect` keyed on `serverMessages`, and only call `setOptimisticMessages` when the filtered result actually differs from `prev` (or track pruned IDs in a ref).

**Status: Fixed** in `src/hooks/useRealtimeMessaging.ts`. The render-phase merge is now a pure derivation with no `setState` call; pruning confirmed optimistic messages moved into a `useEffect` keyed on `serverMessages`, which also bails out (returns the same array reference) when nothing was actually removed, avoiding an unnecessary extra render on top of fixing the crash.

### C4. Auth race condition: a stale session check can resurrect a just-signed-out session
**File:** `src/contexts/AuthContext.tsx:139-214`

`onAuthStateChange` and `getInitialSession()` both write `session`/`user`/`profile` state independently. `getInitialSession()` does an extra `getUser()` network round-trip to validate the JWT, then unconditionally does `setSession(session)` using the value captured *before* that await (lines 201-206).

**Failure scenario:** On load, `getInitialSession()` starts validating a stored session. Before it resolves, the user signs out (or another tab does). The sign-out immediately nulls state — but Supabase's default sign-out only invalidates the refresh token, so the still-valid access token passes the in-flight `getUser()` check. When `getInitialSession()` resolves, it overwrites the just-cleared state with the stale pre-signout session, silently re-authenticating the UI.

**Fix:** Guard the async tail with a generation/mount flag set on `signOut()` and checked before each `setSession`/`setUser`/`setProfile` call, so a superseded response can never clobber a newer result.

**Status: Fixed** in `src/contexts/AuthContext.tsx`. Added an `authVersionRef` counter bumped by every authoritative auth event (`onAuthStateChange` firing, or an explicit `signOut()`); `getInitialSession()` and `fetchProfile()` now capture the version at the start of each async chain and check it before every `setSession`/`setUser`/`setProfile` write, so a response that resolves after a newer event has already landed is discarded instead of applied. While in this file, also fixed the related dead-code bug (M9 below) that this rewrite depended on: `isInitialized` was `useState`, so the `onAuthStateChange` closure (created once, at mount) always read it as `false` and could never clear `loading` itself — replaced with `isInitializedRef` (a ref, correctly visible to that closure), and added logging (M10 below) to the previously-silent profile-fetch failure paths touched by this change.

---

## High

### H1. Blanket-permissive RLS policies misnamed "service role" apply to everyone
**Files:** `supabase/migrations/20260212400000_notification_system.sql:220-223` (`badge_counts`), `20251116024358_ff2a0e6e-5958-4f7b-afcc-f3db6d41379e.sql:70-72,80-82` (`user_vectors`, `entity_vectors`)

`CREATE POLICY "Service role manages X" ON x FOR ALL USING (true) WITH CHECK (true)` — missing `TO service_role`, so it defaults to `PUBLIC` and applies to any authenticated/anon caller, fully overriding the co-located "own row only" policies (permissive policies OR together).

**Impact:** Any authenticated user can delete all `badge_counts` rows or read/overwrite another user's personalization vector.

**Fix:** Add `TO service_role` to all three, matching the correctly-scoped `adin_queries_all_service_role` policy elsewhere in the migrations.

**Status: Fixed, with a significant correction.** Before writing the fix, traced the full migration history for all three tables (policies get dropped and recreated under new names across later migrations — the same class of gap as the H4 correction below) and found the picture had already changed:
- `badge_counts`: the flagged policy is still exactly as described. Fixed with `ALTER POLICY "Service role manages badge counts" ON badge_counts TO service_role;` in `supabase/migrations/20260807130000_fix_service_role_policy_scope.sql`.
- `entity_vectors`: its equivalent write policies were already dropped with no replacement by a later migration (`20260218053744_e5fb06ef-...sql`, "FIX 5"), correctly locking those writes down to `service_role` only (which bypasses RLS via `BYPASSRLS`) — no action needed.
- `user_vectors`: its SELECT policy was likewise already corrected by that same migration (and superseded again by `20260713001028_...sql`) to `user_id = auth.uid() OR admin`. **What was never fixed** is `user_vectors`' three *write* policies (`"System can insert/update/delete user vectors"`, created in an intermediate migration under different names than the ones this finding originally cited) — they remain scoped to "any authenticated user" (`auth.uid() IS NOT NULL`) to this day, letting any signed-in user overwrite or delete any other user's personalization vector. Fixed by scoping those three to `service_role` in the same migration. The one client call site (`saveUserVector` in `src/services/embeddingService.ts`) is confirmed dead code — not imported anywhere in the app — so this is non-breaking.

### H2. PostgREST filter injection in search endpoints
**Files:** `supabase/functions/global-search/index.ts:95-146`, `supabase/functions/ai-search/index.ts:184-236`

User-supplied query text is interpolated unescaped into `.or()` filter strings (e.g. `` `full_name.ilike.${searchTerm}` ``). A query containing `,` or `)` breaks out of the intended filter. Both functions also run with the **service-role key** (bypasses RLS) against `profiles`/`events`/`projects`. The codebase already has the fix pattern in `mcp/index.ts`, which strips `[*(),]` before building `.or()` strings — these two functions don't use it.

**Fix:** Sanitize input the same way `mcp/index.ts` does, and query through an RLS-respecting client rather than service role for user-facing search.

**Status: Fixed.** Both functions now build their `.or()` filter strings from a `sanitizeForOrFilter()` helper that strips PostgREST metacharacters (`*(),`) before interpolation, and both now query through a per-request client scoped to the caller's own JWT (anon key + forwarded `Authorization` header) instead of the service-role key — matching the `send-connection-request` pattern already used elsewhere in this codebase.

### H3. `dia-daily-insights` has no auth gate — unauthenticated callers trigger paid LLM calls
**File:** `supabase/functions/dia-daily-insights/index.ts`; `supabase/config.toml` sets `verify_jwt = false` for it.

Every sibling cron-style function (`generate-daily-briefs`, `generate-opportunity-nudges`, `engagement-reminders`, etc.) gates on `requireInternal`; this one doesn't. Anyone can invoke it, and the "already generated today?" check-then-insert is a TOCTOU race — concurrent unauthenticated calls can each trigger a real LLM call before either writes its result.

**Fix:** Add `requireInternal(req)` like its siblings.

**Status: Fixed.** Added the same `requireInternal(req)` gate used by `generate-daily-briefs` and `engagement-reminders`; `verify_jwt = false` stays in `config.toml` unchanged (that's the established pattern for cron-secret-invoked functions — the gate check happens in code, not at the gateway).

### H4. Per-tier LLM usage limits enforced in only 1 of ~10 DIA endpoints
**File:** `supabase/functions/_shared/dia-core/limits.ts` (the gate) vs. callers.

`checkLimit`/`recordUsage` are called only in `dia-search/index.ts`. `dia-daily-pulse`, `dia-smart-compose`, `dia-smart-replies`, `dia-thread-summary`, `dia-inbox-brief`, `dia-compose-read`, `dia-hub-intelligence`, `get-event-recommendations`, `suggest-usernames` all call `callModel()` directly with no limit check — any authenticated user can call these without bound, defeating tier caps and generating unbounded LLM spend.

**Fix:** Route every DIA capability through `checkLimit`/`recordUsage`.

**Status: Fixed, with one correction.** `dia-daily-pulse`, `dia-smart-compose`, `dia-smart-replies`, `dia-thread-summary`, `dia-inbox-brief`, `dia-compose-read`, `get-event-recommendations`, and `suggest-usernames` now call `checkLimit` before their model call (returning 429, or `quiet('limit_reached')` for `dia-compose-read`'s fail-quiet design) and `recordUsage` after a successful one — 8 of the 9 listed functions. **Correction:** `dia-hub-intelligence` does not actually call an LLM anywhere in its current source (it assembles static region/country config plus DB-driven feed queries) — there is no model call to gate there, so nothing was changed in that file. The original finding's count of "~10 DIA endpoints" appears to have included it in error; treat the real count as 8 (now fixed) of 9 (`dia-search` + these 8).

### H5. `send-password-reset` lets any account trigger a branded reset-style email to an arbitrary address
**File:** `supabase/functions/send-password-reset/index.ts:26-51`

Requires *a* logged-in user (`requireUser`) but sends to whatever `email` and (domain-allowlisted) `resetUrl` the client supplies in the body — it never checks that the target email belongs to the caller. Any account (trivial to create) can make the platform send a legitimate-looking "DNA Platform" email with an attacker-chosen link to any address — a phishing-enablement/email-relay bug.

**Fix:** Derive the recipient from the authenticated user's own account or a server-verified reset token, not client-supplied JSON.

**Status: Fixed.** `requireUser` (in `_shared/auth.ts`) now also returns the caller's own `email` from their validated JWT; `send-password-reset` uses that instead of a client-supplied `email` field, which was removed from the request shape entirely. No client caller of this function exists anywhere in the repo currently, so there was nothing else to update — but the endpoint itself is live and addressable regardless.

### H6. `send-newsletter` exposes all recipients' emails to each other
**File:** `supabase/functions/send-newsletter/index.ts:131-140`

`to: batch.map(f => f.email)` puts up to 50 subscribers in the same `To:` header — each sees the others' addresses (visible via "reply all" or mail-client headers).

**Fix:** Send individually or use `bcc`.

**Status: Fixed.** `resend.emails.send()` now passes the batch through `bcc` and sets `to` to the sending address itself (required non-empty by the mail API).

### H7. SSRF redirect bypass + weak IP-literal check in `link-preview`
**File:** `supabase/functions/link-preview/index.ts:113-121`; guard in `supabase/functions/_shared/auth.ts:95-129`

The initial URL is validated with `isSafePublicUrl`, but `fetch(url, { redirect: 'follow' })` never re-validates redirect targets — a URL public at validation time can 3xx to an internal address (e.g. `169.254.169.254`). Separately, the IP check only matches literal dotted-decimal hostnames, so decimal/hex IP literals (`http://2130706433/` → `127.0.0.1`) bypass it entirely.

**Fix:** Use `redirect: 'manual'` and re-validate each hop; resolve/normalize the hostname before checking, not just the literal string.

**Status: Fixed, with one correction.** `link-preview` now follows redirects manually via a new `fetchFollowingSafeRedirects()` helper that re-validates every hop (max 5) against `isSafePublicUrl` before fetching it. **Correction on the IP-literal claim:** decimal/hex/octal IPv4 literals turned out to already be caught — the WHATWG `URL` parser (used by both `new URL()` calls here) canonicalizes them to dotted-decimal form before `isSafePublicUrl` ever inspects `hostname`, verified with a standalone test (`2130706433`, `0x7f000001`, and `0177.0.0.1` all normalize to `127.0.0.1`). The real, verified gap was **IPv4-mapped/IPv4-compatible IPv6 literals** (e.g. `[::ffff:127.0.0.1]`, normalized by the parser to `[::ffff:7f00:1]`), which encode a blocked IPv4 address inside a bracketed IPv6 host that neither the IPv4 regex nor the plain IPv6 prefix checks ever inspected. `isSafePublicUrl` now strips IPv6 brackets and decodes the embedded IPv4 (both dotted and hex-compressed forms) before applying the same private-range check. All 14 cases in the standalone test (including a real public IPv6 address, to check for false positives) pass.

### H8. N+1 query storm in legacy `messageService.getConversations`; `_offset` silently ignored
**File:** `src/services/messageService.ts:247-361`

For each of up to 50 conversations, two-to-three more sequential queries run in a `for...of` loop (~150 round trips worst case). Live callers: `ForwardMessageDialog.tsx:48`, `ConversationPicker.tsx:47`, `useInboxDigest.ts:53`. The `_offset` parameter is accepted but never applied — pagination beyond page 1 is silently broken.

**Fix:** Batch with `.in()`, group in memory (pattern already used correctly in `groupMessageService.getParticipants`).

**Status: Fixed.** `_offset` is now applied via `.range(offset, offset + limit - 1)`. Rather than aggregate-then-group-in-JS (which for "last message per conversation" would require an unbounded per-batch message scan with no window-function/RPC to bound it correctly), the per-conversation lookups were parallelized with `Promise.all` instead of the sequential `for...of` loop — same queries, same semantics, but ~150 sequential round trips become one round trip's worth of wall-clock latency. Confirmed no live caller passes a non-zero offset today, so this is purely additive.

### H9. `messageService.getMessages` always returns the oldest messages, ignoring the pagination cursor
**File:** `src/services/messageService.ts:366-381`

Orders ascending with `.limit(limit)` and no offset; `_beforeTimestamp` is accepted but never applied. For any conversation over the limit, this can never return recent messages or page further back. (Currently only reachable via an archived legacy component, but the service function itself is broken.)

**Fix:** Order descending, apply `.lt('created_at', beforeTimestamp)`, reverse for display — as `groupMessageService.getMessages` already does correctly.

**Status: Fixed.** Now orders `created_at` descending, applies `.lt('created_at', beforeTimestamp)` when paging further back, and reverses the page to chronological order for display — matching `groupMessageService.getMessages`. Renamed the param from `_beforeTimestamp` to `beforeTimestamp` now that it's used. All current callers pass no cursor and get the default page, so this is a strict improvement (previously-oldest-only → now-most-recent) with no behavior to preserve for existing callers.

### H10. Two shared URL-builder helpers produce links the app can't parse
**File:** `src/lib/config.ts:94-102, 136-138`

- `getConversationUrl` builds `/dna/messages?conversation=<id>`, but `Messages.tsx` only ever reads `useParams().conversationId` (path segment) or a `thread` query param — never `conversation`. Used by `messageService.ts:496` for "new message" notifications/emails; the same broken `?conversation=` pattern is duplicated in `introductionService.ts:142,153`, `platformNotificationGenerator.ts:220`, and `IntroductionModal.tsx:242`.
- `getProfileUrl`'s docstring claims it accepts "username or user ID," but `/u/:slug` is a literal passthrough redirect to `/dna/:slug` with no DB lookup — it only works for an exact real username. The one real caller, `connectionService.ts:140`, passes `full_name || user.id`, producing dead links on "connection accepted" notifications.

**Fix:** Point `getConversationUrl` at `/dna/messages/${conversationId}` (matches the real route); fix `getProfileUrl`'s callers to pass the real `username` field and drop the false "or user ID" claim.

**Status: Fixed.** `getConversationUrl` now points at `/dna/messages/${conversationId}`, confirmed against `Messages.tsx`'s actual `useParams().conversationId` read. Fixed the three duplicated `?conversation=` call sites too (`introductionService.ts:142,153`, `platformNotificationGenerator.ts:220`, `IntroductionModal.tsx:242`). `getProfileUrl` now takes a real `username` and builds `/dna/${username}` directly (the convention used everywhere else in this codebase — `MyProfileRedirect.tsx`, `EventOrganizerCard.tsx`, `ProfileCard.tsx`, etc. — skipping the `/u/:slug` passthrough hop entirely), with its docstring corrected to drop the false "or user ID" claim. Its one caller, `connectionService.ts:140`, now selects and passes the real `username` column, falling back to `/dna/connect` in the edge case where the accepter has no username yet.

### H11. Mic and camera streams never released on unmount
**Files:** `src/components/messaging/inbox/VoiceMessageRecorder.tsx:39-53`; `src/components/convene/management/checkin/CheckInDashboard.tsx:289-366`; `src/components/events/checkin/Scanner.tsx:31-59`

`VoiceMessageRecorder`'s unmount cleanup never clears the recording-timer `setInterval` or stops the live `MediaStream`/`MediaRecorder` (compare the correct sibling `FeedbackVoiceRecorder.tsx:31-38`, which does both). The QR check-in scanners start `decodeFromVideoDevice` but never call `reader.reset()` on unmount or on tab-switch away from the scanner view — only the explicit "Stop" button releases the camera.

**Failure scenario:** A user starts recording/scanning and navigates away without pressing stop; the mic or camera stays active indefinitely (battery drain, persistent "in use" indicator, privacy concern).

**Fix:** Add proper `useEffect` cleanup in all three that stops tracks/clears intervals/calls `reader.reset()`.

**Status: Fixed.** `VoiceMessageRecorder`'s unmount cleanup now clears the recording timer, stops the `MediaRecorder` if still active, and stops the underlying `MediaStream`'s tracks (stored in a new `streamRef`), matching `FeedbackVoiceRecorder`'s already-correct pattern. Both QR scanners (`Scanner.tsx`, `CheckInDashboard.tsx`) now call `reader.reset()` in an unmount cleanup effect; `CheckInDashboard` additionally releases the camera when the active tab switches away from "scanner".

### H12. `Onboarding.tsx` bounces newly-authenticated users to `/auth`, dropping their resume step
**File:** `src/pages/Onboarding.tsx:34, 90-94`

Unlike every other guarded page in the app (`AuthGuard`, `OnboardingGuard`, `Welcome.tsx`, `Index.tsx`, `EventDetail.tsx` — which all wait for `loading` before acting on `user`), this page checks `if (!user) navigate('/auth')` without checking `loading` first. Since `user` starts `null` until the session check resolves, this fires on every mount.

**Failure scenario:** `OnboardingGuard` sends a signed-in, incomplete-profile user to `/onboarding?step=4`; before auth resolves, this effect immediately bounces them to `/auth`, then back to a bare `/onboarding` (losing the `?step=4` context) once auth resolves — visible flash and lost progress.

**Fix:** Destructure `loading` from `useAuth()` and guard: `if (loading) return; if (!user) navigate('/auth', {replace:true});`.

**Status: Fixed** exactly as specified above. The component already returned `null` while `!user` (including during the loading window), so no additional loading-state UI was needed — the effect guard alone closes the bounce.

---

## Medium

- **M1.** `seed-test-accounts` edge function has `verify_jwt = false` in `supabase/config.toml`; confirm it doesn't perform writes against real tables in production, or gate it behind an admin secret/env check.
  **Status: Verified, no fix needed.** It does write to real production tables (`profiles`, `posts`, `events`, `contact_requests`) marked `is_seeded: true`, but it already has its own inline admin-role gate (`requireUser`-equivalent token check + `has_role` RPC), independent of the gateway-level `verify_jwt` setting. No unauthenticated path exists.
- **M2.** `is_signup_approved(p_email)` (`20260804174750_e663c9c2-....sql`) is `SECURITY DEFINER`, granted to `anon`, and lets anyone enumerate which emails are on the beta waitlist.
  **Status: Fixed** in `supabase/migrations/20260807140000_throttle_signup_approval_check.sql`. Anon access is required (the check runs pre-signup), so this is a best-effort throttle, not a hard boundary: a new `signup_approval_check_attempts` table tracks calls by best-effort IP (`request.headers` → `x-forwarded-for`, falling back to a shared "unknown" bucket) and the function now raises past 30 checks/IP/hour. Raises the cost of casual mass enumeration without breaking the legitimate one-check-per-signup flow.
- **M3.** Unbounded, unpaginated cron loops that will time out under load: `engagement-tracker/index.ts:102-204` (all active profiles, ~10 sequential queries each), `connection-health-analyzer/index.ts:128-207` (all accepted connections, similar fan-out), `messages-cleanup/index.ts:38-62`. None batch, parallelize, or checkpoint.
  **Status: Fixed.** All three now cap their initial fetch (`.limit(2000)`) and process in bounded-concurrency chunks (`Promise.all` over batches of 15-20) instead of one sequential round trip at a time — turning ~10 sequential queries × N profiles/connections into N/chunk-size batches of parallel work. True cursor-based continuation across invocations (for counts that could exceed 2000) is a larger architectural change flagged as a follow-up, not implemented here.
- **M4.** `connection-health-analyzer/index.ts:29-33` computes "messages between users" via `.or(sender_id.eq.A, sender_id.eq.B)`, which only checks `sender_id` and never scopes to the actual pair — it counts each user's messages to *anyone*, inflating connection-health scores and defeating the "fading connection" nudge feature.
  **Status: Fixed** alongside M3, in the same file. Now resolves the pair's actual shared `conversations` row(s) first (`user_a`/`user_b` matching either order) and scopes the messages query to those conversation ids.
- **M5.** `handle-beta-approval/index.ts:55` hardcodes the redirect-after-verify URL to the Supabase project domain (`https://ybhssuehmfnxrzneobok.supabase.co/beta-signup-complete`) instead of the app domain — approved beta users land on a dead backend URL instead of onboarding.
  **Status: Fixed, with a further correction.** Switched to `APP_URL` env var (falling back to `https://diasporanetwork.africa`, matching `create-payment`'s and other functions' convention). Also discovered `/beta-signup-complete` isn't a registered route anywhere in `src/App.tsx` — even the domain fix would have 404'd. Redirects to the app root instead: `Index.tsx` already sends any authenticated user to `/dna/feed`, and `OnboardingGuard` takes it from there for a freshly-verified, not-yet-onboarded user.
- **M6.** Non-atomic read-modify-write counters: `useFollow.ts:88-104` (`follower_count`/`following_count`, errors silently swallowed) and `messagingPrdService.ts:374-389` (`unread_count`) can lose increments under concurrent access; should be DB-side atomic increments/triggers, as already done correctly in `groupMessageService`.
  **Status: Fixed.** `supabase/migrations/20260807150000_atomic_follow_counts.sql` adds a `sync_follow_counts` trigger on `user_follows` that maintains both counters atomically (`SET count = count + 1`, safe under concurrent writes via row-level locking); `useFollow.ts` no longer writes to `profiles` directly, only to `user_follows`, then refetches. `supabase/migrations/20260807160000_atomic_messaging_unread_bump.sql` adds a `messaging_bump_unread_counts` RPC replacing `messagingPrdService.sendMessage`'s per-participant read-then-write loop with one atomic UPDATE. While fixing the latter, found the adjacent `conversations_new` update in the same function references columns (`message_count`, `last_message_sender_id/name`) that don't exist on that table per its migration history — likely never-executed dead code (this whole `sendMessage` path has no live caller). Left that specific line's table-mismatch as a flagged comment rather than guessing at the intended schema; not part of the M6 atomicity claim.
- **M7.** `usePostSearch.ts:37-165` and `messageService.getConversations`/`useUniversalFeed.ts:14-17` have offset/limit values that don't actually affect the query or aren't part of the React Query cache key — "load more" silently reloads page 1, or a second caller with a different limit gets a stale cached page size.
  **Status: Fixed.** `usePostSearch.ts`'s two queries now apply `.range(offset, offset + limit - 1)` instead of `.limit(limit)` alone. `useUniversalFeed.ts`'s query key now includes `limit`. (`messageService.getConversations`'s `_offset` was already fixed under H8.)
- **M8.** Admin dashboard sidebar (`AdminDashboardLayout.tsx:46-143`) links to ~14 routes never registered under `/admin` in `App.tsx` (e.g. `/admin/users/pending`, `/admin/settings`, `/admin/audit-log`) — clicking them exits the admin shell entirely to the global 404 page instead of an in-shell "coming soon" state.
  **Status: Fixed.** Added `src/pages/admin/AdminComingSoon.tsx` and registered it as a `path="*"` catch-all child of `/admin` in `App.tsx`, so any nav link without a real page yet stays in-shell with a clear "coming soon" message instead of falling through to the site-wide 404.
- **M9.** ~~`AuthContext.tsx:143-159` — the `onAuthStateChange` closure captures `isInitialized` at mount (effect has `[]` deps) and never sees it update; the `if (isInitialized) setLoading(false)` branch can never fire.~~ **Fixed** alongside C4: `isInitialized` state replaced with `isInitializedRef` (a ref, correctly visible to the long-lived closure).
- **M10.** ~~`AuthContext.tsx` swallows profile-fetch errors with empty/comment-only catch blocks (lines 98-100, 113-115, 127-129, 210-213) — an RLS misconfiguration or transient DB error results in `profile: null` for a fully authenticated user with zero logging, making the failure invisible in production.~~ **Fixed** alongside C4: every previously-silent catch in `fetchProfile` now logs via `logger.error`/`logger.warn`.
- **M11.** `Join.tsx:41-44` schedules an uncancelled `setTimeout(() => window.location.replace(...), 2000)` with no cleanup in its effect — navigating away within the 2s window still forces the stale redirect.
  **Status: Fixed.** The timer id is now captured in a ref and cleared in the effect's cleanup.

---

## Low

- **L1.** Error responses in several edge functions (`create-event/index.ts:273`, `send-newsletter`, `seed-test-accounts`, others) return raw Postgres error text to the client, leaking schema/column names.
  **Status: Fixed** for the genuinely user-facing case, `create-event/index.ts` — now logs the real DB error server-side and returns a generic client-facing message. `send-newsletter` and `seed-test-accounts` are both admin-gated (per M1), so leaking DB detail to a trusted admin operator is much lower-risk; left as-is rather than a blanket sweep across every edge function returning `error.message`, which is out of proportion for a Low-severity, widespread-by-design finding.
- **L2.** `send-magic-link/index.ts:5` and `seed-test-accounts/index.ts:206` hardcode the production Supabase project URL as a fallback instead of failing loudly if `SUPABASE_URL` is unset.
  **Status: Fixed.** Both now use `Deno.env.get('SUPABASE_URL')` directly with no hardcoded fallback; each already had (or now has) an explicit check-and-fail path if it comes back empty, returning a clear "not configured" error instead of silently targeting production.
- **L3.** `send-connection-request/index.ts:62-85,149-186` has a TOCTOU gap between its rate-limit/duplicate check and the write — concurrent requests can burst past the 20/hour limit or create duplicate pending rows.
  **Status: Fixed** for the duplicate-connection half, the higher-value fix: `supabase/migrations/20260807170000_unique_connection_pair.sql` adds a unique index on the unordered pair (`LEAST`/`GREATEST` of the two user ids, after a defensive one-time dedup of any pre-existing bidirectional duplicates), so the database itself now rejects a second connection row between the same two users regardless of direction. The edge function catches the resulting `23505` and returns the same friendly "already pending" response it already used for the non-racy case. The rate-limit TOCTOU (bursting past 20/hour) is left as accepted risk — it's an explicitly soft, generous cap ("wait before sending more"), not a security boundary, and a fully atomic distributed rate-limiter is disproportionate to build for this.
- **L4.** `useConveyFeed.ts:26-153` applies its `region` filter client-side, after `.range()`-based pagination — a page can read as empty even when matching rows exist elsewhere (currently dormant; no live caller passes `region`).
  **Status: Fixed.** `region` is now resolved against the `spaces` table *before* pagination (matching space ids fed into `.in('space_id', ...)` on the posts query), so it composes correctly with `.range()` and with the existing "only my spaces" filter (two `.in()` calls on the same column, which PostgREST ANDs together — the correct intersection).
- **L5.** `MessageContext.tsx:6,59` imports a no-op stub `usePresenceHeartbeat` from `useApresence.ts` instead of the real implementation in `hooks/messaging/usePresenceHeartbeat.ts` (which `App.tsx` mounts separately at the app root, masking the bug today). Two identically-named hooks with different implementations is a latent footgun.
  **Status: Fixed, and the footgun removed entirely.** Corrected the import to the real hook (verified safe: the real hook's underlying `presenceChannel.ts` singleton is ref-counted, so mounting it from both `App.tsx` and `MessageProvider` simultaneously is a harmless redundant acquire/release, not a duplicate-subscription bug). While tracing this, found the entire stub module (`src/hooks/usePresence.ts`) had zero remaining live callers once this one was fixed — its other stub exports (`usePresence`, `useConversationPresence`) were already dead, and `useUserPresence` (used correctly by `ChatHeader.tsx`) already came from the real `hooks/messaging/useUserPresence.ts`, not this stub. Deleted the now-fully-dead file rather than leave the naming-collision footgun in place for the next person to trip over.
- **L6.** `src/utils/username.ts` (dots allowed, 3-30 chars) and `src/lib/username/validation.ts` (`USERNAME_RULES`, no dots, 3-20 chars) define conflicting username policies; the former is currently only referenced from an `_archived` component, so it's dead code rather than a live inconsistency today.
  **Status: Fixed.** Rather than delete `src/utils/username.ts` (which would break the build for its `_archived` — but still compiled — consumer), tightened its regex to match the canonical `USERNAME_RULES` exactly, removing the conflicting policy at the source without touching the archived file.

---

## Areas reviewed and found solid

- React Query cache-key discipline and realtime channel cleanup elsewhere in `src/hooks` — ref-counted singleton subscription registries (`useProfile.ts`, `useUnreadCounts.ts`, `presenceChannel.ts`) correctly guard against duplicate-subscribe errors; no missing-unsubscribe leaks found outside the items above.
- `dangerouslySetInnerHTML` — no user-generated content is rendered through it anywhere in `src/components`; post/comment/message rendering paths build React elements, not raw HTML.
- Composer/feed/messaging submit flows correctly disable controls while a mutation is pending; list renders key off stable IDs, not array index.
- Route-guard logic in `AuthGuard`, `OnboardingGuard`, `AdminRouteGuard`, and `EventDetail.tsx` (loading-state handling, redirect-loop prevention) is correct and consistent — the pattern `Onboarding.tsx` (H12) should have followed.
- `_shared/auth.ts` (`requireUser`/`requireAdmin`/`requireInternal`) is well-designed and correctly used in the large majority of edge functions; `stripe-webhook`, `create-payment`, `dia-trigger-prompt`, `transcribe-voice`, `oembed-proxy`, `unsubscribe-email`, and `mcp/index.ts` are good reference implementations (signature verification, RLS-respecting clients, PostgREST metacharacter stripping) for fixing the items above.
- Date/timezone code (`src/lib/events/timezone.ts`, `eventTime.ts`, `parseNaturalWhen.ts`), validation/permission code (`profileCompletion.ts`, `featureGate.ts`, `privacy.ts`), caching (`rateLimit.ts`, `queryClient.ts`, `realtimeManager.ts`), and formatting utilities in `src/lib`/`src/utils` are unusually well-tested and defensive, with comments documenting prior incidents and their fixes — no new defects found.
- Route param naming, static-vs-dynamic route ordering, and `ChromeOwnerContext` layout-ownership logic in `App.tsx` and `src/layouts` are consistent throughout.

---

## Suggested fix order

1. **C1** (IDOR) and **H1** (permissive RLS) — these are live data-exposure bugs affecting real users' private data; fix first, independent of any deploy schedule.
2. **C2** (Manage event routing) and **C3** (group chat crash) — both are visible, reproducible breakage in core flows (event management, messaging) that any organizer/user can hit today.
3. **C4** (auth race) and **H12** (onboarding bounce) — auth-state correctness issues; fix together since both touch `AuthContext`/guard patterns.
4. **H2–H7** (edge function security: search injection, unauthenticated LLM endpoint, missing usage limits, password-reset relay, newsletter Bcc, SSRF) — bundle as a security-hardening pass.
5. **H8–H11** (messaging service correctness, broken deep links, camera/mic leaks) — user-facing but lower urgency than the above.
6. Medium/Low items as capacity allows; several (M6, M7, L4, L5) are currently dormant and only need fixing before their dead code paths are reactivated.

**Update (2026-08-07):** All Critical, High, Medium, and Low findings (C1–C4, H1–H12, M1–M11, L1–L6) have been triaged, and every one that required a code change now has one on this branch (M1 was verified to already be correctly gated and needed no change). Several findings were corrected during implementation after re-tracing the current live state rather than trusting the original grep-based finding at face value — see the "Status" notes on **H1** (the actually-unfixed policies were `user_vectors`' write policies, not the ones originally named — `entity_vectors` had already been hardened by a later migration), **H4** (`dia-hub-intelligence` doesn't call an LLM at all, so there was nothing to gate there), **H7** (decimal/hex IPv4 literals were already safe; the real gap was IPv4-mapped IPv6 literals), **M5** (the redirect target itself wasn't a registered route, beyond just the wrong domain), and **M6** (found and flagged a further, out-of-scope table-mismatch bug in the same dead-code function while fixing its atomicity issue). One item, the rate-limit half of **L3**, is intentionally left as accepted risk rather than fixed — see its note.

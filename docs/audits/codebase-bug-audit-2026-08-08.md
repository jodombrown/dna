# DNA Codebase Bug Audit — 2026-08-08 (second pass)

**Auditor:** Claude Code (Sonnet 5), 8-way parallel read-only audit followed by a 3-way parallel verification/investigation sweep
**Scope:** `jodombrown/dna-May-2026` working tree on branch `claude/codebase-bug-audit-b8kmcv`, starting from the state left after every finding in `codebase-bug-audit-2026-08-07.md` was fixed
**Method:** Eight independent agents re-swept the codebase for bugs the first pass didn't cover — with an explicit instruction to trace every migration/RLS grep hit forward to its *latest* definition rather than trust the first hit, since the first pass had already caught three stale-grep false leads this way. A second round of three agents then verified and pinned down exact file:line locations for every Medium/Low candidate before any fix was written. This document consolidates both rounds, ordered by severity, with every item cross-checked against actual call sites.

**Note:** This audit is functional/security-only. It does not evaluate the design-system rules in `CLAUDE.md`.

---

## Executive summary

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 6 |
| Medium | 18 |
| Low | 12 |

**Update (2026-08-08, same day):** Every finding below is fixed on this branch — see the "Status" note under each. A handful of candidate findings that came up during triage did not survive verification against current code; those are listed separately at the end under "Investigated, not confirmed" for the record, following the same discipline the first pass applied to its own H1/H4/M5/M6 corrections.

The migration-sweep agent's single most consequential finding: the same IDOR pattern the first pass fixed in 8 RPCs (a caller-supplied identity parameter trusted without checking `auth.uid()`) was present in **17 more** `SECURITY DEFINER` functions that the first pass's grep simply didn't reach — profile-update functions, group-participant management, hashtag ownership actions, and several notification/admin RPCs.

---

## Critical

### C1. IDOR: 17 more `SECURITY DEFINER` RPCs trust a caller-supplied user ID
**Functions (all in `supabase/migrations/20260808100000_fix_second_pass_idor_and_policy_scope.sql`):** `update_profile_identity`, `update_profile_about`, `update_profile_skills`, `update_profile_contributions`, `update_profile_interests`, `add_group_participant`, `remove_group_participant`, `get_user_owned_hashtags`, `get_pending_hashtag_requests`, `review_hashtag_request`, `toggle_hashtag_follow`, `admin_verify_user`, `mark_notifications_read`, `mark_all_notifications_read`, `endorse_skill`, `record_profile_view_hub`, `trigger_dia_rematch`.

Same root cause as the first pass's C1: the blanket `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated` (`20250809005352_...sql`) makes every `SECURITY DEFINER` function RPC-addressable, and each of these accepted a `p_user_id`/`target_user_id`/`admin_user_id` parameter as its sole trust boundary. `add_group_participant`/`remove_group_participant` had a second, distinct gap on top of the identity check: no role check at all, so *any* existing participant in a group conversation could add or remove *anyone* — not just group owners/admins.

**Exploit:** e.g. `POST /rest/v1/rpc/update_profile_identity` with another user's profile ID lets an attacker overwrite that user's name/headline/location; `POST /rest/v1/rpc/add_group_participant` lets any conversation member add an arbitrary user (or remove one) from any group conversation they happen to know the ID of.

**Status: Fixed** in `supabase/migrations/20260808100000_fix_second_pass_idor_and_policy_scope.sql`. Every identity-scoped function now has `IF p_user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Not authorized'; END IF;` (or the equivalent for its actual parameter name); `add_group_participant`/`remove_group_participant` additionally check the caller's own `conversation_participants.role IN ('owner', 'admin')` before mutating.

### C2. Vulnerable dead overload of `block_user`/`unblock_user`
**File:** `supabase/migrations/20260223002941_c020fafc-d30b-4dde-80ca-30661f4a0d0e.sql` (superseded overload)

A second, IDOR-vulnerable overload of `block_user(uuid, uuid)`/`unblock_user(uuid, uuid)` existed alongside the already-safe overload that checks `auth.uid()`. Postgres function overload resolution means the vulnerable signature was still callable directly by UUID pair, bypassing the safe one.

**Status: Fixed** — the vulnerable overloads are dropped in the same migration (`DROP FUNCTION IF EXISTS public.block_user(uuid, uuid);` / `unblock_user`), leaving only the safe overload.

### C3. Six RLS policies missing a `TO service_role` clause
**Tables:** `reminder_logs` (3 policies), `messaging_metadata`, `dia_rematch_queue`, `hashtags`

Each policy is named like `"System can insert reminder logs"` — clearly intended as internal/maintenance-only — but none had a `TO` clause restricting it to `service_role`. Combined with the blanket EXECUTE grant, this meant any authenticated caller could trigger the underlying writes directly via PostgREST, not just the intended cron/service-role jobs.

**Status: Fixed** — all six policies now carry `ALTER POLICY ... TO service_role;` in the same migration as C1/C2.

---

## High

### H1. `send-push-notification`: broken auth path for every real "send" caller, plus no actual VAPID signing
**File:** `supabase/functions/send-push-notification/index.ts`

The `send` branch required `requireInternal()` (service-role key or `CRON_SECRET`), but both real callers — `messageService.ts` (no `action` field at all, falling into this branch) and `notificationSystemService.ts` (`action: 'send'`) — invoke it from an ordinary user's browser session to push a notification to a *different* user. Neither ever presents a service-role key. Separately, the VAPID "signing" was never implemented: the code sent the plaintext payload with a bare `Crypto-Key: p256ecdsa=...` header and no VAPID JWT or Web Push payload encryption (RFC 8291/8292) — every real push service would reject it regardless of auth.

**Status: Fixed.** The `send` branch now accepts either an authenticated user or a genuine internal caller. Replaced the manual `fetch()` with `npm:web-push@3.6.7`, which implements VAPID JWT signing and payload encryption correctly.

### H2. `send-notification-email`: any authenticated user can email attacker-controlled content, including an unescaped link, to any other user
**File:** `supabase/functions/send-notification-email/index.ts`

`action_url` was interpolated raw into an `<a href="...">`, and `title`/`message`/`actor_name` were interpolated raw into the HTML body and email subject — no validation, no escaping. Both live callers (`notificationService.ts`, `notificationSystemService.ts`) are inherently cross-user by design (that's the point of a notification), so the fix couldn't be a simple caller-must-equal-target check.

**Status: Fixed.** `action_url` now resolves only to a relative path on our own app domain or an allowlisted host (mirroring `send-password-reset`'s `ALLOWED_HOSTS` pattern); `title`/`message`/`actor_name`/`userName` are HTML-escaped before interpolation.

### H3. `send-universal-email`: backwards auth gate rejects all 13+ real callers
**File:** `supabase/functions/send-universal-email/index.ts`

`requireInternal()` demands the service-role key or `CRON_SECRET`. This function backs public, pre-signup marketing forms (waitlist, ambassador signup, beta signup, feedback, survey, demo request) submitted by anonymous site visitors — the browser never has either credential, so every real call was rejected outright.

**Status: Fixed** — the gate is removed; existing input sanitization (script/iframe/`javascript:`/event-handler stripping) is unchanged.

### H4. `process-automated-nudges`: no auth check at all
**File:** `supabase/functions/process-automated-nudges/index.ts`

A cron-only job that walks every overdue task and stalling space system-wide and fires DB writes for each, with zero auth check and zero client callers.

**Status: Fixed** — added `requireInternal()`.

### H5. `place-search`: no auth on a paid Google Places API proxy
**File:** `supabase/functions/place-search/index.ts`

A thin proxy onto Google's Places API billed per request against DNA's own key, callable by anyone who found the function URL, no account required.

**Status: Fixed** — added `requireUser()`; its only caller (`PlaceSearchField`, in the event composer) already runs behind a logged-in session.

### H6. `GroupJoinRequests.tsx`: an RLS mismatch silently hides every pending join request in a group
**File:** `src/components/groups/GroupJoinRequests.tsx`

The component joined `group_join_requests` to `profiles(user_id)` and read `req.profiles.username` unconditionally. `profiles`' SELECT policy only lets a viewer see a profile that's public, their own, or an accepted connection — exactly what a join request from a stranger isn't. PostgREST returned `profiles: null` for that row, and the property read threw a `TypeError`, failing the *entire* query (not just that row) — so `if (!requests || requests.length === 0) return null` made the whole pending-requests panel silently disappear for a group with even one non-public/unconnected requester.

**Status: Fixed.** Added `get_group_join_requests`, a `SECURITY DEFINER` RPC scoped to "caller is owner/admin of that group" (the same deliberate privacy carve-out pattern as `admin_verify_user`), plus defensive `?? 'Unknown'` fallbacks in the component either way.

---

## Medium

### M1. `delete-account`: no storage cleanup, and dead/wrong-column DB cleanup entries
**File:** `supabase/functions/delete-account/index.ts`

No edge function did any storage cleanup on account deletion — avatars, post media, and story images outlived a deleted account indefinitely. Separately, three of the DB cleanup entries targeted tables dropped entirely in `20251001163626_...sql` (`connection_preferences`/`connection_intentions`/`connection_events`), and the `connections` cleanup used columns (`a`/`b`) that don't exist on the live schema (real columns are `requester_id`/`recipient_id`) — both failed silently every run, caught and only logged as a warning.

**Status: Fixed.** Added a recursive storage sweep (`avatars`, `dna-media-public`, `post-media` — the buckets that actually key files by uid-prefixed path in current upload code); removed the three dead entries; fixed the `connections` cleanup to use the real columns.

### M2. `compress-image`: no auth or rate limit on a paid TinyPNG proxy
**File:** `supabase/functions/compress-image/index.ts`

`verify_jwt = true` only requires *some* signed JWT, and the public anon key satisfies that — it gated nothing on a function that proxies every call to TinyPNG's paid API against our own key.

**Status: Fixed** — added `requireUser()` plus a body-size cap.

### M3. `auto-archive-releases`: missing `requireInternal`
**File:** `supabase/functions/auto-archive-releases/index.ts`

No auth check on a cron job that mass-archives releases system-wide, no client callers.

**Status: Fixed.**

### M4. `messaging-email-digest`: unbounded loop, and every send has been silently failing
**File:** `supabase/functions/messaging-email-digest/index.ts`

Fully sequential, uncapped loop over every digest recipient. Independently: it called `send-universal-email` with a `{type, data: {to, subject, html}}` body, but that function only understands `{formType, formData}` and throws "Unknown form type: undefined" for anything else — every digest send has been failing 100% of the time, caught by this function's own `try/catch` and never surfaced.

**Status: Fixed** — capped the recipient RPC, batched sends with bounded concurrency, and switched to sending directly via Resend (this function already builds its own complete HTML) instead of the mismatched `send-universal-email` call.

### M5. `generate-sitemap`: missing `verify_jwt = false` config entry
**File:** `supabase/config.toml`

No entry for this function at all, so it fell back to the platform default of `verify_jwt = true` — a crawler's plain unauthenticated GET is rejected at the gateway before the function ever runs.

**Status: Fixed** — added the config entry.

### M6. `dia-smart-chips`: unscoped "network activity" query
**File:** `supabase/functions/dia-smart-chips/index.ts`

The "recent event RSVPs by my network" chip's query had no scoping filter at all. RLS (self-or-host read only) already bounded the actual exposure, but the query didn't match what it claimed to check, firing the chip for every caller regardless of their own activity.

**Status: Fixed** — scoped to `.eq('user_id', user.id)`.

### M7. `curate-diaspora-events`: TOCTOU dedup race
**File:** `supabase/functions/curate-diaspora-events/index.ts`

Existing curated events were read into an in-memory `Set` once per run; two overlapping invocations could both decide the same Perplexity-returned event was new and insert it twice. No DB-level guard existed for this key.

**Status: Fixed** — added a generated, stored dedupe key with a partial unique index (`idx_events_curated_dedupe_key`, migration `20260808110000`, with a defensive pre-cleanup dedup of any pre-existing duplicates); a `23505` unique-violation on insert is now treated as a skip rather than a hard error.

### M8. `watch-curated-sources`: SSRF gap
**File:** `supabase/functions/watch-curated-sources/index.ts`

`curated_source_url` (LLM/admin-supplied) was fetched with no SSRF guard, unlike every other externally-supplied-URL fetch in this codebase.

**Status: Fixed** — added the `isSafePublicUrl` check already used by `link-preview` et al.

### M9. `send-survey-response`: no spam protection
**File:** `supabase/functions/send-survey-response/index.ts`

Zero auth, rate limiting, or size bounds on a public survey endpoint that emails two real inboxes per submission.

**Status: Fixed (partial)** — added a per-field length cap to bound the cost of a flood-with-huge-payloads pattern. A full rate limiter needs new DB state and is out of scope for this pass.

### M10. `send-event-blasts`: unbounded loops
**File:** `supabase/functions/send-event-blasts/index.ts`

Both the outer `event_blasts` query and the inner per-recipient send loop were fully sequential and uncapped — risking function timeout and hitting Resend's rate limits on any blast with a large segment. (Auth was already correct here — admin/organizer/service-role gated — no change needed.)

**Status: Fixed** — capped both queries and batched the send loop with bounded concurrency.

### M11. `badge-service.ts`: TOCTOU on featured-badge count
**File:** `src/services/badge-service.ts`, live via `ProfileBadges.tsx` on `ProfileV2.tsx`

`toggleBadgeFeatured` read the current featured count, then wrote a separate update if under the 3-max limit — two concurrent "feature" clicks (double-click, two tabs) could both read a stale count and land on 4+ featured badges.

**Status: Fixed** — added `set_badge_featured`, doing the count-check and the update in one statement (migration `20260808120000`).

### M12. `useReleases.ts`: non-atomic view-count increment on a live route
**File:** `src/hooks/useReleases.ts`, live at `/releases/:slug`

`useRelease` read `view_count` in the same `select`, then wrote `stale_value + 1` — concurrent viewers lost increments under load.

**Status: Fixed** — added `increment_release_view_count`, a single atomic `UPDATE` (migration `20260808120000`).

### M13. `usePostLikes.ts` / `useCommentReactions.ts`: cache key missing `userId`
**Files:** `src/hooks/usePostLikes.ts`, `src/hooks/useCommentReactions.ts`

Query keys didn't include `userId` even though the cached result embeds userId-derived fields (`userHasLiked`, `userReaction`). The first fetch — often while auth is still resolving with `userId` undefined — cached a "no user" result under a key every later `userId` would share.

**Status: Fixed** — `userId ?? 'anon'` added to both query keys.

### M14. `CreateStory.tsx`: the cover image is silently dropped on every submit
**File:** `src/pages/dna/convey/CreateStory.tsx`, live at `/dna/convey/create`

`ConveyItemForm` produces `coverImage` (camelCase); `useCreateConveyItem` expects `image_url`. Nothing mapped between them, so every story insert wrote `image_url: null` regardless of what the user picked in `CoverImageEditor`.

**Status: Fixed** — `handleSubmit` now maps `formData.coverImage` to `image_url`.

### M15. `CreateStory.tsx`: space/event/need deep-link context never reaches the form
**File:** `src/pages/dna/convey/CreateStory.tsx`

A fully-wired `handleSubmit` (setting `primary_space_id`/`primary_event_id`/`primary_need_id`/`focus_areas`) and computed `prefillData` existed but were never called/passed — the inline `onSubmit` bypassed both, and `ConveyItemForm` never received `initialData`/`spaceId`/`spaceName`/`spaceVisibility`/`eventId`/`eventTitle`/`needId`/`isAdmin`. Creating a story from a space/event/need deep link lost all of that context.

**Status: Fixed** — wired `handleSubmit`/`handleCancel` and all the missing props into the render.

### M16. `PublicEventPage.tsx`: RSVP intent is lost across the sign-in round-trip
**File:** `src/pages/PublicEventPage.tsx`, live at `/event/:slugOrId`

An anonymous visitor's RSVP intent was stored in `sessionStorage` before redirecting to sign in, but nothing ever read it back — the RSVP they asked for before being asked to sign up was silently lost.

**Status: Fixed** — now stores `{eventId, status}` and auto-fires the RSVP mutation once the user is back and logged in.

### M17. Orphaned nav link: `/app/admin/sponsorships`
**File:** `src/pages/admin/AdminLayout.tsx` (link), `src/App.tsx` (missing route)

`AdminLayout` links to `/app/admin/sponsorships`, but no route was ever registered for it (or its `logo-audit` sub-page) even though both pages exist fully built (`SponsorshipManagement`, `SponsorLogoAuditLog`) — the link 404'd.

**Status: Fixed** — both routes added under `/app/admin`.

### M18. `?field=` query param never applied on the Discover page
**Files:** `src/components/hubs/connect/ZeroConnectionsState.tsx`, `src/pages/dna/connect/Discover.tsx`

The zero-connections empty state linked to Discover with `?field=<lowercased label>` (e.g. `tech`), but Discover never read any query param, and the taxonomy it actually filters on (`DiscoverFilterSheet`'s `INDUSTRIES` list) uses different casing/wording entirely (`Technology`, not `Tech`; no `Arts` or `Entrepreneurship` at all) — even a fix on one end alone wouldn't have worked.

**Status: Fixed** — the buttons now use the canonical industry strings, and Discover reads `?field=` on mount and seeds the industries filter.

---

## Low

### L1. `UsernameManager.tsx`: stale-response race
**File:** `src/components/profile/UsernameManager.tsx`

The debounce only prevented overlapping *scheduling*, not overlapping *requests* — a slower, earlier availability check could overwrite a faster, later one's result.

**Status: Fixed** — added a request-id guard; stale responses are discarded.

### L2. `useLocationSearch.ts`: stale-response race
**File:** `src/hooks/useLocationSearch.ts`

Same class of bug as L1, in the location-search hook.

**Status: Fixed** — same request-id guard pattern.

### L3. `SignUpApprovalGate.tsx`: stale-response race
**File:** `src/components/auth/SignUpApprovalGate.tsx`

`checkApproval` runs from both `onBlur` and `handleSubmit` with no sequencing — whichever RPC response resolved last won, regardless of which email was currently in the input.

**Status: Fixed** — compares the resolved candidate against the latest one issued before applying the result.

### L4. `useAnimatedCounter.ts`: no `requestAnimationFrame` cleanup
**File:** `src/hooks/useAnimatedCounter.ts`

No `cancelAnimationFrame` on unmount or on a re-run of the effect — a pending frame could call `setCount` after unmount, or two animation loops could race if `end`/`duration`/`decimals` changed while already visible.

**Status: Fixed** — added the cleanup.

### L5. `ReleaseFilters.tsx`: fake debounce
**File:** `src/components/releases/ReleaseFilters.tsx`

`handleSearchChange` scheduled a fresh, uncancelled `setTimeout` on every keystroke — called directly from `onChange`, not a `useEffect`, so its returned cleanup function was never invoked by anything. Not debounced at all, just individually delayed per keystroke.

**Status: Fixed** — the timer is now held in a ref and cleared before each new one is scheduled.

### L6. `useNeedMutations`: cache invalidation gap
**File:** `src/hooks/contribute/useNeeds.ts`

`invalidate()` never overlapped `useOpenNeeds`' query key (`['contribute','needs','open',userId]` vs. `['contribute','needs',userId]`/`['contribute','needs','user',userId]` — the third element never matched) — publishing/closing/deleting a need never refreshed the community-wide Needs lens.

**Status: Fixed** — added the missing invalidation.

### L7. `DnaMessages`: route-param resync gap (dormant)
**File:** `src/pages/dna/Messages.tsx`

`selectedConversationId` was only ever seeded from `useParams().conversationId` once, on mount — navigating between two conversations under the same route kept the component mounted with a new param nothing resynced to. Currently dormant: `MESSAGING_ENABLED = false` redirects both `/dna/messages` routes.

**Status: Fixed** — added a `useEffect` resyncing on `conversationId` changes, ahead of reactivation.

### L8. `GroupSettingsPage.tsx`: render-guard gap
**File:** `src/pages/GroupSettingsPage.tsx`

The owner/admin check lived only inside a `useEffect`, which runs after commit — a non-admin hitting the settings route got one render of the full settings UI before the redirect fired.

**Status: Fixed** — added a synchronous guard before the main render.

### L9. `getWebsiteSchema()`: dead `SearchAction` route
**File:** `src/components/seo/PageSEO.tsx`

The homepage's JSON-LD `SearchAction` pointed at `/connect?q={search_term_string}`; `/connect` is one of the Five C's marketing routes deliberately redirected home pending redesign (drops the query string), and no live page reads a `q` param today.

**Status: Fixed** — removed the `SearchAction` rather than guess at an unbuilt target; advertising a capability the site doesn't have is worse than omitting it. Revisit once a real search-capable landing page exists.

### L10. `messagingPrdService.ts`: three more non-atomic counters (dead code)
**File:** `src/services/messagingPrdService.ts`

`pinMessage`/`unpinMessage` and `addParticipant`/`removeParticipant` each read `conversations_new`'s `pinned_message_count`/`participant_count`, then wrote back `stale_value ± 1` — the same class of lost-update race as the `unread_count` counter already fixed in the first pass (finding M6 part 2). These write paths have zero live callers today (only the read-only `getEventThread`/`getConversation` path is reachable, via `useEventThread` → `EventThreadCTA`).

**Status: Fixed** — added `messaging_bump_pinned_count`/`messaging_bump_participant_count` (migration `20260808140000`), closing the defect before these paths are activated.

### L11. `src/services/dia/networkIntelligence.ts`: wrong-scope queries (dead code)
**File:** `src/services/dia/networkIntelligence.ts`

`getMessageMetrics` filtered on `.or(sender_id.eq.A, sender_id.eq.B)` with no conversation scoping — counting each user's messages to *anyone*, the same bug already fixed in `connection-health-analyzer` (first pass, M4) but not carried over here. `getMutualEngagements` filtered `post_likes` on `userAId` alone; `userBId` was an unused parameter, returning `userAId`'s total like count instead of any actual intersection. `networkIntelligenceService` has zero live callers.

**Status: Fixed** — `getMessageMetrics` now scopes to the pair's shared conversation(s); `getMutualEngagements` now intersects both users' liked post IDs.

### L12. Dead-code landmines: duplicate bottom-nav render, and a previews/selectedFiles desync
**Files:** `src/components/hubs/shared/AspirationMode.tsx`, `src/components/mobile/MobileViewContainer.tsx`, `src/components/feedback/FeedbackMediaUpload.tsx`

The first two unconditionally rendered their own `<MobileBottomNav />`; every real layout either would be mounted inside already renders one, so reactivating either as-is would double up the bottom nav on mobile. `FeedbackMediaUpload` built its `previews` as independent local state from async `FileReader` callbacks that can resolve out of order for multiple simultaneously-selected files, so `previews[index]` wasn't guaranteed to match `selectedFiles[index]`, and had no way to notice if a parent mutated `selectedFiles` other than via `onRemoveFile`. None of the three have live callers today.

**Status: Fixed** — removed the redundant `MobileBottomNav` renders; `FeedbackMediaUpload`'s previews are now derived synchronously from the `selectedFiles` prop via object URLs.

---

## Investigated, not confirmed

Following the same discipline the first pass applied to its own H1/H4/M5/M6 corrections — verify against current code, don't trust the finding on faith:

- **Duplicate route registrations for `EventCheckIn`/`EventAnalytics`** — each has exactly one lazy import and one `<Route>` usage in `App.tsx`; both reachable. No duplication found.
- **`ContributionModerationQueue.tsx` "unverifiable table-naming flag"** — no such comment/TODO exists in the current file, and the table it queries (`dia_contributor_requests`) is real and matches the generated schema types. Either the flag never existed or was already removed; no trace in git history either way.
- **`messageConversationActions.ts` "phantom success"** — every exported function checks and throws on both the read and write error paths; no unchecked-error/silent-success pattern exists in this file. (A related but distinct minor issue was noted one layer up, in `ConversationListPanel.tsx`'s `triggerPoof`, which starts a removal animation before its callback's write completes — a UX flicker during a 250ms window, not a phantom-success bug. Left as-is; not part of this fix pass.)

---

## Verification

Every fix in this document was verified with:
- `npx tsc --noEmit` — clean before and after every change.
- Full `npx vitest run` — 280 passed, 8 pre-existing unrelated failures (`panelChrome.test.tsx`, `eventFormDisclosure.test.tsx`) before and after every change, confirmed pre-existing in the first audit pass.
- Deno-syntax-checked every edited edge function via `ts.transpileModule` (no Deno runtime available in this environment).
- `npx eslint` on every touched file, confirmed to introduce no new violation class beyond each file's pre-existing baseline.

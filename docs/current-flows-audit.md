# DNA Platform — Current Auth + Feed Flow Audit

**Compiled:** 2026-05-24
**Cycle:** v0.0 planning (BD009)
**Purpose:** Identify everything `/dna/auth` and `/dna/feed` touch today, so the D054
identity-layer migration can land without breaking either surface.

> Read-only audit. No code modified. All file paths and line numbers refer to the
> tree at the head of branch `claude/dna-v0-mobile-pwa-ca0Sp`.

---

## 1. Auth flow — sign-up, sign-in, password reset, session

### 1.1 Entry-point files

| Route | Component | File |
|---|---|---|
| `/auth` | `Auth` | `src/pages/Auth.tsx` |
| `/reset-password` | `ResetPassword` | `src/pages/ResetPassword.tsx` |
| `/invite/:code` (invite signup) | `InviteSignup` | `src/pages/InviteSignup.tsx` |
| `/onboarding` | `Onboarding` | `src/pages/Onboarding.tsx` |
| (route wrapper) | `AuthGuard`, `OnboardingGuard` | `src/App.tsx:231`, `src/components/auth/OnboardingGuard.tsx` |
| (session) | `AuthProvider`, `useAuth` | `src/contexts/AuthContext.tsx` |
| (supabase client) | `supabase` | `src/integrations/supabase/client.ts` |

### 1.2 Supabase client config (`src/integrations/supabase/client.ts:13-35`)

- PKCE flow.
- Auto-refresh + persist session enabled.
- `storageKey: 'dna-auth-token'` — distinct, the mobile build will need its own.
- `storage: window.localStorage` — **web-only**; cannot be reused as-is in any RN target.
- `db.schema: 'public'`.
- Realtime configured (`eventsPerSecond: 10`).

### 1.3 Sign-up

Public signup is **disabled**; the `/auth` page is sign-in only. Two pathways exist:

1. **Invite signup** (`src/pages/InviteSignup.tsx`):
   - Validates invite code from `invites` table (`expires_at`, `used_at`).
   - Calls `supabase.auth.signUp({ email, password, options: { data: { full_name, is_beta_tester, referral_code } } })`.
   - Calls RPC `handle_referral_signup` to mark the invite used.
   - **Does not write a `profiles` row directly** — that's deferred to first session.
2. **Waitlist** — most signups are deflected to `/waitlist` (no auth row created).

### 1.4 Sign-in (`src/pages/Auth.tsx`, calling `AuthContext.signIn`)

- `supabase.auth.signInWithPassword({ email, password })`.
- OAuth (LinkedIn) wired but not the primary path: `supabase.auth.signInWithOAuth({ provider: 'linkedin_oidc', redirectTo: '/dna/feed' })`.
- On success, `AuthContext.onAuthStateChange` fires → `fetchProfile(userId)`.

### 1.5 Password reset (`src/pages/ResetPassword.tsx`)

- `supabase.auth.resetPasswordForEmail(email, { redirectTo: <origin>/onboarding/reset-password-complete })`.
- **No reset-completion page is registered in `App.tsx`** (gap; not D054-blocking).
- `AuthContext.updatePassword()` exists but is not wired into a UI screen reachable from the reset link in the current code.

### 1.6 Session handling — `src/contexts/AuthContext.tsx`

- Manages: `user`, `session`, `profile`, `loading`, `isInitialized`.
- Subscribes to `supabase.auth.onAuthStateChange`.
- `fetchProfile(userId)`: `SELECT * FROM profiles WHERE id = $1`, with one 150 ms retry if the trigger hasn't yet inserted the row.
- Profile is cached in React state; exposes `refreshProfile()` for forced refetch.
- Loading sentinel persists until `isInitialized = true`.

### 1.7 Route guards — `src/App.tsx:231`, `src/components/auth/OnboardingGuard.tsx`

- **`AuthGuard`** (`App.tsx:231–248`): if `redirectAuth=true` and user is signed in → `/dna/feed`. Used on `/auth` and `/reset-password`.
- **`OnboardingGuard`** (`OnboardingGuard.tsx:11–74`): runs a small `useQuery` that selects `onboarding_completed_at, username` from `profiles`. Gating rule (line 46):
  ```ts
  const hasCompletedOnboarding = !!(profile?.onboarding_completed_at || profile?.username);
  ```
  - Unauthenticated → `/auth`.
  - Authenticated + not completed + not on `/onboarding` → `/onboarding`.
  - Authenticated + completed + on `/onboarding` → `/dna/connect/discover`.
- Wraps every protected `/dna/*` route in `App.tsx` (feed, network, messages, settings, collaborate, convene, contribute, etc.). **Does not** wrap `/onboarding` itself (line 314) or `/dna/welcome` (line 315).

### 1.8 Onboarding flow — `src/pages/Onboarding.tsx`

Five-step wizard via `useOnboardingForm` (`src/components/onboarding/hooks/useOnboardingForm.ts`). Each step has its own component under `src/components/onboarding/steps/`:

| Step | Component | Required fields | DB writes |
|---|---|---|---|
| 0 | `UserTypeStep` | `user_type` | (none until step 5) |
| 1 | `IdentityStep` | `first_name`, `last_name`, `avatar_url`, `current_country`, `headline` | — |
| 2 | `DiasporaOriginStep` | `country_of_origin`, `diaspora_status` | — |
| 3 | `DiscoveryStep` | `focus_areas`, `regional_expertise`, `industries`, `engagement_intentions` | — |
| 4 | `UsernameStep` | `username` | UPSERT into `profiles` + UPDATE `onboarding_completed_at = now()` |

Final write at the end of step 5 (Onboarding.tsx, ~line 154 then ~line 182):
```ts
supabase.from('profiles').upsert([{
  id: user.id,
  first_name, last_name, full_name, username, avatar_url, current_country,
  user_type, country_of_origin, diaspora_status,
  profession, professional_role, professional_sectors, skills,
  years_experience, interests, my_dna_statement, focus_areas,
  regional_expertise, industries, engagement_intentions,
  is_public: true, updated_at: new Date().toISOString()
}], { onConflict: 'id' });

supabase.from('profiles')
  .update({ onboarding_completed_at: new Date().toISOString() })
  .eq('id', user.id);
```

### 1.9 Profile-completion (separate from onboarding) — `src/hooks/useProfileCompletion.ts`

- Reads `profile_completion.steps_completed` and counts derived activity (`connections`, `posts`, `space_members`).
- Used for the "complete your profile" nudge UI; **not** part of route gating.
- Step list (lines 100–189): `photo`, `headline`, `location`, `bio`, `skills`, `sectors`, `first_connection`, `first_event`, `first_space`, `first_opportunity`, `first_post`.

### 1.10 Admin role check — `src/components/admin/AdminRouteGuard.tsx`

- Calls RPC `get_current_admin_status` (returns granular admin tier).
- Reads `user_roles` for `app_role` membership.
- Independent of `user_type` and orthogonal to D054's `dna_role`.

### 1.11 Database tables touched by the auth flow

| Table | R/W | When |
|---|---|---|
| `auth.users` | W | sign-up (Supabase managed) |
| `profiles` | R | `AuthContext.fetchProfile`, `OnboardingGuard` |
| `profiles` | UPSERT/UPDATE | `Onboarding.tsx` final step |
| `invites` | R / W (`used_at`) | `InviteSignup.tsx` |
| `profile_completion` | R/W | `useProfileCompletion` |
| `connections`, `posts`, `space_members` | R | `useProfileCompletion` activity checks |
| `user_roles` | R | `AdminRouteGuard` (admin paths) |

---

## 2. Feed flow — `/dna/feed`

### 2.1 Entry points

| Concern | File |
|---|---|
| Route element | `src/App.tsx:426` (`<DnaFeed />` wrapped in `OnboardingGuard`) |
| Page | `src/pages/dna/Feed.tsx` |
| Infinite-scroll container | `src/components/feed/UniversalFeedInfinite.tsx` |
| Card router | `src/components/feed/UniversalFeedItem.tsx` |
| Card components | `src/components/feed/cards/{StoryCard,EventCard,SpaceCard,NeedCard}.tsx`; `src/components/posts/PostCard.tsx` |
| Composer | `src/components/composer/UniversalComposer.tsx` |
| Threaded comments | `src/components/posts/ThreadedComments.tsx` |
| Feed hook (paginated) | `src/hooks/useInfiniteUniversalFeed.ts` |
| Feed hook (single page) | `src/hooks/useUniversalFeed.ts` (older; not used by Feed page) |
| Engagement hooks | `src/hooks/usePostLikes.ts`, `usePostReactions.ts`, `usePostBookmark.ts`, `useReshare.ts` |
| Type | `src/types/feed.ts` — `UniversalFeedItem` |

### 2.2 The core RPC: `get_universal_feed`

Defined in `supabase/migrations/20260418000000_fix_get_universal_feed_pagination.sql`.

**Parameters:** `p_viewer_id uuid, p_tab text, p_limit int, p_offset int, p_ranking_mode text, p_author_id?, p_space_id?, p_event_id?`.

**Tabs:** `all` | `for_you` | `network` | `my_posts` | `bookmarks`.

**Tables joined:**
- `posts p` (main)
- `profiles prof` (INNER JOIN on `p.author_id`)
- `posts op` (LEFT JOIN for original post on reshares)
- `profiles op_prof` (LEFT JOIN for original author)
- Aggregates from `post_reactions`, `post_comments` (filtered by `is_deleted = false`)
- `connections c` for visibility predicates
- `post_bookmarks pb` for the bookmarks tab

**Profile columns it projects** (lines 67–70 of the migration):
```
prof.username   AS author_username
prof.full_name  AS author_full_name
prof.avatar_url AS author_avatar_url
prof.headline   AS author_headline
```
Same four for the reshared `original_*` author.

**Notably absent from the projection:**
- `verified` / `verification_status` (so the feed has no verification badge)
- `user_type` / `roles`
- Any `*_country*` / `diaspora_*` / continent column

### 2.3 Visibility (inside the RPC, lines 127–162)

| Tab | Predicate |
|---|---|
| `all` | public OR own OR connections-only with accepted connection |
| `for_you` | public OR own OR accepted connections |
| `network` | accepted connections only |
| `my_posts` | `author_id = p_viewer_id` |
| `bookmarks` | post bookmarked by `p_viewer_id` |

### 2.4 Page composition — `src/pages/dna/Feed.tsx`

- Uses `useAuth()`, `useProfile()`, `useUniversalComposer()`, `useMobile()`, `useHeaderVisibility()`, `useScrollDirection()`.
- Composer surface: sticky bar (desktop) / Vaul drawer (mobile).
- Tab state: `all` / `for_you` / `network` / `my_posts` / `bookmarks`.
- Ranking modes: `latest` / `top`.

### 2.5 Cards

- `UniversalFeedItem.tsx` switches on `post_type` → routes to:
  - `StoryCard.tsx` (when `post_type = 'story'`)
  - `PostCard.tsx` (default)
  - `EventCard.tsx` / `SpaceCard.tsx` / `NeedCard.tsx` for cross-pillar feed items
- All cards read `author_username`, `author_full_name` (display name), `author_avatar_url`, `created_at`.
- `PostCard.tsx:269` is the only place `author_headline` is rendered (under the author name).
- **No card renders verification status, user type, or country today.**

### 2.6 Engagement hooks

| Hook | Table(s) | Notes |
|---|---|---|
| `usePostReactions` | `post_reactions` | Emoji + heart reactions (primary path) |
| `usePostLikes` | `post_likes` (+ `post_reactions`) | Legacy/heart; "liked by" list fetches profile rows (`full_name`, `username`, `avatar_url`, `headline`) |
| `usePostBookmark` | `post_bookmarks` | No profile join |
| `useReshare` | `posts` (insert with `original_post_id`) | Carries `originalAuthorId` / `originalAuthorName` in notification metadata |
| Threaded comments | RPC `get_threaded_comments` | Returns `author_username`, `author_full_name`, `author_avatar_url` |

### 2.7 Composer — `src/components/composer/UniversalComposer.tsx`

- Modes: `post` / `story` / `event`.
- Reads `profile.avatar_url` from `useProfile()`.
- INSERTs into `posts` with `author_id = user.id`, `post_type`, `content`, `media_urls`, `media_types`, optional `space_id` / `event_id`, optional `tags`.

### 2.8 Tables touched by the feed flow

| Table | R/W | When |
|---|---|---|
| `posts` | R | via `get_universal_feed`, `get_threaded_comments` |
| `posts` | W | composer, reshare, soft-delete |
| `profiles` | R | inside `get_universal_feed` join; "liked by" list |
| `post_reactions` | R/W | reactions hook |
| `post_likes` | R/W | legacy likes hook |
| `post_bookmarks` | R/W | bookmark hook, `bookmarks` tab |
| `post_comments` | R/W | threaded comments |
| `connections` | R | visibility filter inside RPC |
| `feed_engagement_events` | W | telemetry on engagement |

---

## 3. Gaps relevant to D054

The migration introduces (per the D054 brief): a `dna_role` enum on `profiles`
(`returnee` / `anchor` / `ally` / `exploring`), an `affirmations` table, and
`dna_country_iso3` + `dna_continent_id` columns on `profiles`. The gaps below are
points where existing code makes assumptions that will need to be revisited.

### 3.1 Single-tier identity assumption

- `OnboardingGuard` (line 46) treats onboarding as a **one-shot**: `onboarding_completed_at` OR `username` → done forever. There is no mechanism today to force a user who pre-dates the new identity layer to re-declare role + place on next login.
- `Onboarding.tsx` (lines 71–74) short-circuits to `/dna/feed` if `onboarding_completed_at` is set, so simply navigating to `/onboarding` cannot prompt a re-declaration.
- D054 will need a **gating predicate that goes beyond `onboarding_completed_at`** — see the migration plan §11 for the proposed `dna_identity_declared_at` column + `OnboardingGuard` enhancement.

### 3.2 Overlapping role/type fields

- `profiles.user_type` already takes `'ally'` as a legitimate value via the onboarding `UserTypeStep`. D054's `dna_role` also defines `'ally'`. The two are **not** the same concept (web onboarding category vs. D054 identity layer). The migration must not collapse them; nothing in the feed or auth code should auto-promote a `user_type='ally'` row into `dna_role='ally'`.
- `profiles.roles text[]` exists but is unused by the feed query and only loosely tracked by other code. D054 keeps it untouched.

### 3.3 Place fields are a thicket

- The profile already has eight country-shaped columns: `current_country`, `current_country_code`, `current_country_id`, `current_country_name`, `country_of_origin`, `country_of_origin_id`, `country_origin`, plus `origin_country_code` / `origin_country_name`. None is consistently ISO-3.
- `IdentityStep` and `DiasporaOriginStep` use `CountryCombobox` / `SearchableCountrySelect` to write `current_country` and `country_of_origin` as free-form strings (not codes).
- D054's `dna_country_iso3` adds a single authoritative ISO-3 column rather than disturb the legacy ones. Backfill from existing columns must be a follow-up scripted pass (the legacy values are unreliable).
- `continents` has no `code` column, so D054 must either add one to `continents` or carry the continent reference as a UUID FK. The plan currently uses the UUID FK.

### 3.4 Profile completeness vs. identity-tier completeness

- `useProfileCompletion` and `OnboardingGuard` are **independent** systems and neither knows about identity tier today.
- D054 introduces a third dimension (`dna_role` declared / not declared) that should be gated by `OnboardingGuard`, not folded into the `profile_completion` nudge system.

### 3.5 Feed RPC needs new columns projected

- Today, `get_universal_feed` projects only `username`, `full_name`, `avatar_url`, `headline`. If the feed needs to render a role badge ("Anchor") or a country flag, the RPC's column list and the `UniversalFeedItem` TypeScript type must both be extended.
- Until that's done, D054 columns can land additively without touching the feed at all — the new role surface is profile-page-only.

### 3.6 Verification badge has no current feed surface

- `verification_status` and `verified` exist on `profiles` and are surfaced on the profile page (`src/components/profile-v2/ProfileV2Verification.tsx`), but **not** in any feed card. D054's role badge would be the first identity badge to appear in the feed — design the visual treatment with that in mind (it sets the precedent).

### 3.7 OAuth post-login redirect

- LinkedIn OAuth (`AuthContext.signIn`) redirects to `/dna/feed` — bypassing `/onboarding` is not possible because `/dna/feed` is wrapped in `OnboardingGuard`, which will bounce a non-onboarded user back to `/onboarding`. The same guard becomes the natural place to add the D054 re-declaration check; no new redirect plumbing needed.

### 3.8 Profile fetch is `SELECT *`

- `AuthContext.fetchProfile` and `useProfile` use `SELECT *`. New D054 columns appear automatically in the returned shape after `types.ts` is regenerated, so additive columns won't break existing reads. The only risk is the regenerated TypeScript widening — confirm `npm run typecheck` passes after the post-migration `supabase gen types` step.

---

## 4. File inventory (quick reference)

| File | Why D054 cares |
|---|---|
| `src/contexts/AuthContext.tsx` | Session + profile cache; entry point for any login-time hook |
| `src/components/auth/OnboardingGuard.tsx` | Where the D054 re-declaration gate lands |
| `src/pages/Onboarding.tsx` | Where the new `dna_role` + `dna_country_iso3` selection UI plugs in |
| `src/components/onboarding/steps/UserTypeStep.tsx` | Place to either add a new "DNA role" step or expand this one |
| `src/components/onboarding/steps/DiasporaOriginStep.tsx` | Place to add ISO-3 country picker |
| `src/components/onboarding/hooks/useOnboardingForm.ts` | New form fields (`dna_role`, `dna_country_iso3`, `dna_continent_id`) go here |
| `src/integrations/supabase/client.ts` | No D054 change; mobile client (separate repo) needs distinct `storageKey` |
| `src/pages/dna/Feed.tsx` | No D054 change unless feed UI gains a role badge |
| `supabase/migrations/20260418000000_fix_get_universal_feed_pagination.sql` | RPC to extend if feed cards need role / country surfacing |
| `src/components/feed/cards/*.tsx`, `src/components/posts/PostCard.tsx` | Where a role badge would render |
| `src/hooks/useProfileCompletion.ts` | Unrelated; do not fold identity-tier checks in here |
| `src/components/admin/AdminRouteGuard.tsx` | Unrelated; `app_role` stays as the admin ladder |
| `src/integrations/supabase/types.ts` | Regenerate after the migration |

# DNA Platform — Current Schema Inventory

**Compiled:** 2026-05-24
**Cycle:** v0.0 planning (BD009)
**Purpose:** Single, scannable reference for the live schema before the D054 identity-layer migration.

> ⚠️ **Source is static.** This inventory is derived from committed artifacts only —
> `src/integrations/supabase/types.ts` (auto-generated against the live DB on its last regeneration),
> the SQL files under `supabase/migrations/`, and `docs/DNA-SUPABASE-SCHEMA-EXPORT.md`
> (dated 2026-03-09). It is **not** the result of a live `information_schema` query against
> `ybhssuehmfnxrzneobok.supabase.co`. Treat anything time-sensitive (newly added columns,
> policy edits made outside migration files, ad-hoc admin changes) as needing verification
> against the live DB before the migration is authored.

---

## Conventions

- Source-of-truth precedence when artifacts disagree:
  1. `src/integrations/supabase/types.ts` (auto-generated; most current)
  2. Latest `supabase/migrations/*.sql` that touches the table
  3. `docs/DNA-SUPABASE-SCHEMA-EXPORT.md`
- PKs are `uuid` with `gen_random_uuid()` default unless noted.
- `nullable` column is `YES` unless explicitly `NO`.
- RLS is enabled on every public-schema table; per-policy detail is given only where
  it directly bears on D054 (auth, profile, role, geography, feed).
- Column-level detail is given for D054-relevant tables (§1–§4). A complete alphabetical
  table catalog is in §11.

---

## Module map

| Module | Tables of D054 interest | Other tables (summary in §11) |
|---|---|---|
| 1. Foundation / Auth | `profiles`, `user_roles`, `profile_completion`, `user_onboarding_selections` | `users`, `feature_flags`, `error_logs`, `invites` |
| 2. Geography | `continents`, `regions`, `countries`, `provinces` | `diaspora_data`, `economic_indicators`, `geographic_relevance` |
| 3. Feed / Convey | `posts`, `post_reactions`, `post_comments`, `post_bookmarks` | Engagement tables — §11 |
| 4. Connect | `connections`, `blocked_users` | Messaging tables — §11 |
| 5+ Convene, Collaborate, Contribute, Communities, DIA, Impact, Admin | (out of scope for D054) | §11 |
| 6. Enums | §10 | — |
| 7. RLS patterns | §9 | — |

---

## 1. FOUNDATION — Auth, Profiles, Onboarding

### 1.1 `profiles` ⭐ (central table)

`profiles.id` is also the FK back to `auth.users.id` — there is no separate "user row"
the app reads from. Profile row is created on first session via a deferred trigger
(see `docs/current-flows-audit.md` §1).

Column list below is taken from `types.ts` lines 6757–6971 (Row shape). This is the
**single source of truth** for the live shape; the older `CREATE TABLE` statements in
`supabase/migrations/` predate many of these additive columns.

#### Identity / display

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| id | uuid | NO | PK, = `auth.users.id` |
| username | text | NO | unique |
| email | text | YES | |
| first_name / last_name / middle_initial | text | YES | |
| full_name / display_name | text | YES | |
| pronouns | text | YES | |
| avatar_url / profile_picture_url | text | YES | |
| avatar_position | jsonb | YES | |
| banner_url / banner_gradient / banner_overlay / banner_type | text/bool | YES | |
| headline / bio / intro_text | text | YES | |
| intro_audio_url / intro_video_url | text | YES | |
| diaspora_story | text | YES | |
| my_dna_statement | text | YES | free-form personal statement |

#### Professional / sectors

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| professional_role / profession / company / organization / organization_name / organization_category | text | YES | |
| venture_name / venture_stage | text | YES | |
| industry | text | YES | |
| industries / industry_sectors / professional_sectors / sectors | text[] | YES | |
| years_experience / years_of_experience | int4 | YES | |
| professional_summary | text | YES | |
| certifications / education / achievements | text | YES | |
| skills / skills_offered / skills_needed | text[] | YES | |
| skill_tags / collaboration_tags / availability_tags / event_interest_tags / intent_tags / region_tags / sector_tags / diaspora_tags / contribution_tags / language_tags | jsonb | YES | |
| interests / interest_tags / advocacy_interests | text[] / jsonb | YES | |
| impact_areas / impact_goals / impact_regions / sdg_focus / regional_expertise / focus_areas | text[] | YES | |
| africa_focus_areas / african_causes / africa_visit_frequency | text[] / text | YES | |
| home_country_projects / giving_back_initiatives / volunteer_experience / community_involvement / past_contributions | text | YES | |
| return_intentions | text | YES | |

#### Role / type (⚠️ D054-relevant overlap surface)

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| **roles** | text[] | YES | free-form labels; **not** an enum — D054 normalizes |
| **user_role** | text | YES | single string variant; usage uneven |
| **user_type** | text | YES | onboarding-set; observed values: `individual`, `organization`, `diaspora_professional`, `founder`, `ally`. Older schema export lists default `'member'`; current onboarding (`src/pages/Onboarding.tsx`) writes one of the five values. |
| selected_pillars / engagement_intentions / intentions / intents | text[] | YES | |
| collaboration_needs / available_for / offers / needs / networking_goals / contribution_types / support_areas / what_to_give / what_to_receive | text[] | YES | |
| mentorship_areas / mentorship_interest | text[] | YES | |
| mentorship_offering / seeking_mentorship / availability_for_mentoring | bool | YES | |
| availability_hours_per_month / available_hours_per_month | int4 | YES | |
| availability_visible / open_to_opportunities / looking_for_opportunities | bool | YES | |

#### Place (⚠️ D054-relevant; many overlapping fields)

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| location | text | YES | free-form |
| location_preference | text | YES | |
| city / current_city | text | YES | |
| current_region | text | YES | |
| **current_country** | text | YES | free-form name string |
| **current_country_code** | text | YES | likely ISO-2 (no FK declared in `types.ts`) |
| **current_country_id** | uuid | YES | intended FK → `countries.id` (declared FK not visible in `types.ts` Relationships for `profiles`) |
| **current_country_name** | text | YES | denormalized |
| current_location | text | YES | |
| **country_of_origin** | text | YES | free-form name string |
| **country_of_origin_id** | uuid | YES | intended FK → `countries.id` |
| **country_origin** | text | YES | legacy duplicate of `country_of_origin` |
| **origin_country_code** | text | YES | |
| **origin_country_name** | text | YES | |
| **diaspora_origin** | text | YES | legacy origin label |
| **diaspora_status** | text | YES | enum-like; set by onboarding `DiasporaOriginStep` |
| diaspora_networks | text[] | YES | |
| ethnic_heritage | text[] | YES | |
| years_in_diaspora / years_in_diaspora_text | int4 / text | YES | |
| languages | text[] | YES | |
| timezone | text | YES | |

#### Contact / consent / visibility

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| linkedin_url / twitter_url / twitter_handle / facebook_url / instagram_url / github_url / website_url | text | YES | |
| phone / phone_number / whatsapp_number | text | YES | |
| preferred_contact / preferred_contact_method | text | YES | |
| contact_number_visibility | text | NO | required column |
| email_visible / allow_profile_sharing | bool | YES | |
| consent_event_invites / consent_marketing_emails / consent_partner_intros / consent_public_search / agrees_to_values | bool | YES | |
| email_notifications / notifications_enabled / newsletter_emails | bool | YES | |
| notification_preferences / profile_visibility_settings / visibility | jsonb | YES | |
| account_visibility | text | YES | |
| is_public | bool | YES | default `true` |
| is_admin | bool | YES | legacy flag; admin actually checked via `user_roles` + RPC |
| is_beta_tester / is_test_account | bool | YES | |
| beta_status / beta_phase / beta_expires_at / beta_signup_data / beta_feedback_count / beta_features_tested | text/jsonb/etc | YES | |

#### Verification

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| **verified** | bool | YES | default `false` |
| **verification_status** | enum `verification_status` | YES | per `types.ts`: `pending_verification`, `soft_verified`, `fully_verified` (NULL = unverified). Older schema-export doc also lists `unverified` and `rejected` — verify against live DB. |
| verification_method | text | YES | |
| verification_updated_at / verified_at | timestamptz | YES | |
| referral_code / referrer_id | text / uuid | YES | |

#### Onboarding / progression

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| **onboarding_completed** | bool | YES | |
| **onboarding_completed_at** | timestamptz | YES | **primary gate read by `OnboardingGuard`** |
| **onboarding_progress** | jsonb | NO | required column |
| onboarding_recommendations_viewed | bool | YES | |
| onboarding_stage | text | YES | |
| dashboard_version | text | YES | |
| adin_mode / adin_prompt_status | text | YES | |

#### Scores / counters / activity

| Column | Type | Nullable | Default / note |
|---|---|---|---|
| connection_count / follower_count / following_count | int4 | YES | |
| profile_completeness_score / profile_completion_percentage / profile_completion_score | int4 | YES | three parallel scoring cols — DIA consolidation target |
| profile_views_count | int4 | YES | |
| impact_scores | jsonb | YES | default `'{}'` (added `20260222_sprint13_profile_platform.sql`) |
| impact_scores_updated_at | timestamptz | YES | |
| dia_insight | text | YES | added sprint13 |
| dia_insight_updated_at | timestamptz | YES | |
| first_action_completed / first_action_type | bool / text | YES | |
| tour_completed_at / tour_current_step / tour_last_shown_at / tour_skipped_at | timestamptz / int4 | YES | |
| hidden_activity_ids / pinned_activity_ids / recent_searches | jsonb / text[] | YES | |
| username_changes / username_change_count / username_changes_count / username_changes_left | int4 | YES | multiple legacy counters |
| username_history | jsonb | YES | |
| last_active / last_active_at / last_seen_at | timestamptz | YES | |
| auto_connect_enabled | bool | YES | |
| deleted_at | timestamptz | YES | soft-delete |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |

**FKs declared in `types.ts`:** the `profiles` Row Relationships array is `[]` —
declared FKs from `profiles` to other tables are not visible in `types.ts`. The legacy
schema export and the onboarding code reference `country_of_origin_id` / `current_country_id`
→ `countries.id` as if they exist; verify against live DB before treating as enforced.

**Notable RLS** (after consolidation in `20251111022747_…sql`, lines 113–132):
- `profiles_insert` — `WITH CHECK auth.uid() = id`
- `profiles_select` — `USING is_public = true OR auth.uid() = id`
- `profiles_update` — owner-only (`auth.uid() = id`); set in older migrations, not dropped by the consolidation pass
- No public DELETE policy

**D054 implication:** The table already has overlapping role/type/place surface
(`roles text[]`, `user_role text`, `user_type text`, 8+ country/origin columns). D054
**extends** — it does not replace. The plan must declare which existing fields the new
`dna_role` enum supersedes (none, for back-compat) and which it leaves intact.

---

### 1.2 `user_roles`

Platform-role table (admin / moderator), distinct from the user-facing identity tier.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| user_id | uuid | NO | FK → `profiles.id` |
| role | enum `app_role` | NO | values: `user`, `moderator`, `admin` |
| granted_at | timestamptz | YES | `now()` |
| granted_by | uuid | YES | FK → `profiles.id` |

**Unique:** `(user_id, role)`
**RLS:** Public SELECT (`USING true`); INSERT/UPDATE/DELETE gated by `has_role(auth.uid(),'admin')`.
**D054 implication:** Untouched. D054 introduces a separate `dna_role` enum on `profiles`
for identity tier (returnee / anchor / ally / exploring); `app_role` stays as the
platform-permission ladder.

---

### 1.3 `profile_completion`

| Column | Type | Nullable | Default |
|---|---|---|---|
| user_id | uuid | NO | PK |
| steps_completed | text[] | YES | |
| guide_dismissed | bool | YES | |
| guide_minimized | bool | YES | |
| completed_at | timestamptz | YES | |
| updated_at | timestamptz | YES | |

No declared FK relationships in `types.ts` (`Relationships: []`) — joins by convention
only. **Not** read by `OnboardingGuard`; tracks post-onboarding "complete your profile"
nudges.

---

### 1.4 `user_onboarding_selections`

Free-form key/value pairs captured during the onboarding wizard for analytics /
recommendations.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| user_id | uuid | NO | FK → `profiles.id` (via `user_onboarding_selections_user_id_fkey`) |
| selection_type | text | NO | e.g. `'role'`, `'pillar'`, `'sector'` |
| target_id | text | NO | |
| target_title | text | YES | |
| selected_at | timestamptz | YES | `now()` |
| created_at | timestamptz | YES | `now()` |

---

### 1.5 Other foundation tables (one-line)

- `users` — legacy proxy table (`id`, `email`, `created_at`). Not used by the app.
- `feature_flags` — `key text NOT NULL, enabled bool NOT NULL DEFAULT false, description text`.
- `error_logs` — `user_id, error_type NOT NULL, error_message NOT NULL, stack_trace, route, metadata jsonb`.
- `invites` — invite code → signup tracking; used by `InviteSignup.tsx`.

---

## 2. GEOGRAPHY — Reference Data

D054's place layer reuses these. The `countries` table already carries ISO-2 and ISO-3
codes — D054 does not need to create new geography tables, only to add columns to
`profiles` that point at this data with stable conventions.

### 2.1 `continents`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| name | text | NO | |
| description | text | YES | |
| created_at / updated_at | timestamptz | NO | `now()` |

**No `code` column.** D054 must decide whether to add one (e.g. `AF`/`NA`/`EU`/…) before
storing continent on `profiles` as a stable string. See plan doc §C.3.

### 2.2 `regions`

Africa-focused sub-continental regions (West / East / Central / Southern / North).

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| name | text | NO | |
| continent_id | uuid | YES | FK → `continents.id` |
| description / description_short / description_full | text | YES | |
| region_code / region_slug | text | YES | |
| hero_image_url | text | YES | |
| map_coordinates | jsonb | YES | |
| timezone_primary | text | YES | |
| languages_primary | text[] | YES | |
| diaspora_population_estimate | int4 | YES | |
| interest_tags / key_sectors / skill_relevance | text[] | YES | |
| status / tagline | text | YES | |
| created_at / updated_at | timestamptz | NO | `now()` |

### 2.3 `countries`

Rich country profile (used by `pages/africa/CountryHubPage`).

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| name | text | NO | |
| region_id | uuid | NO | FK → `regions.id` |
| **country_code_iso2** | text | YES | ISO 3166-1 alpha-2 |
| **country_code_iso3** | text | YES | ISO 3166-1 alpha-3 — **column D054 references** |
| iso_code | text | YES | legacy duplicate of iso2 |
| country_slug | text | YES | URL slug |
| capital / capital_coordinates | text / jsonb | YES | |
| currency_code / timezone | text | YES | |
| official_languages | text[] | YES | |
| population / gdp_usd / gdp_growth_rate | int4 / numeric | YES | |
| diaspora_population_estimate / diaspora_top_destinations | int4 / text[] | YES | |
| key_sectors / skill_relevance / interest_tags | text[] | YES | |
| description / description_short / description_full / tagline | text | YES | |
| flag_url / hero_image_url | text | YES | |
| status | text | YES | |
| created_at / updated_at | timestamptz | NO | `now()` |

**Open question for D054:** Is there a UNIQUE index on `countries.country_code_iso3`?
If yes, the new `profiles.dna_country_iso3` column can be a hard FK. If not, the plan
uses a regex CHECK and defers the FK to a follow-up.

### 2.4 `provinces`

Sub-national divisions (FK → `countries.id`). Not needed for D054 v0.0 minimum (the
region/state/city hierarchy lands later per D029/D030).

---

## 3. CONVEY — Feed surface

### 3.1 `posts` ⭐

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| author_id | uuid | NO | FK → `profiles.id` |
| content | text | YES | |
| post_type | text | YES | `'post'` (stories use `'story'`) |
| media_urls / media_types | text[] | YES | |
| image_url / link_url | text | YES | |
| link_preview | jsonb | YES | |
| original_post_id | uuid | YES | FK → `posts.id` (reshares) |
| space_id / event_id / community_id | uuid | YES | |
| tags | text[] | YES | |
| visibility | text | YES | `'public'` |
| is_pinned / is_deleted / is_featured | bool | YES | `false` |
| like_count / comment_count / share_count / view_count | int4 | YES | `0` |
| engagement_score | float8 | YES | `0` |
| story_title / story_subtitle / story_hero_image_url / story_content | text | YES | story-specific |
| story_reading_time | int4 | YES | |
| story_published_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | NO | `now()` |

**Notable RLS:** Public SELECT for `visibility='public' AND is_deleted=false`; owner
SELECT always; INSERT/UPDATE/DELETE owner-gated by `author_id = auth.uid()`. Per-tab
visibility (connections-only, network) is enforced inside the `get_universal_feed` RPC.

### 3.2 `get_universal_feed` RPC (core to the feed; not a table)

Defined in `supabase/migrations/20260418000000_fix_get_universal_feed_pagination.sql`.

**Profile columns it joins and returns:** `username`, `full_name`, `avatar_url`,
`headline` (for both primary author and reshared original author). It does **not**
currently project `verified`, `verification_status`, `user_type`, `roles`, or any
country column. If D054 wants the feed to surface a role/place badge, this RPC needs
its column list extended. See `docs/current-flows-audit.md` §2 for the call graph.

### 3.3 Other feed tables (one-line)

- `post_comments` — `post_id, user_id, content, parent_id, is_deleted`.
- `post_reactions` — `post_id, user_id, reaction_type`; unique `(post_id, user_id)`.
- `post_bookmarks` — `post_id, user_id`.
- `post_likes` — legacy; current code uses `post_reactions`.
- `post_views` / `post_shares` / `post_analytics` — engagement telemetry.
- `feed_bookmarks` / `feed_reactions` / `feed_reshares` / `feed_comments` /
  `feed_engagement_events` — duplicate of `post_*` for the feed surface;
  consolidation flagged in the schema export.
- `hidden_posts` / `muted_authors` / `post_reports` — moderation.
- `hashtags`, `post_hashtags`, `hashtag_followers`, `hashtag_analytics`,
  `hashtag_usage_requests`, `reserved_hashtags` — hashtag subsystem (no D054 impact).

---

## 4. CONNECT — Connections (DMs out of scope for D054)

### 4.1 `connections`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | PK |
| requester_id | uuid | NO | FK → `profiles.id` |
| recipient_id | uuid | NO | FK → `profiles.id` |
| status | text | NO | `'pending'` → `'accepted'` / `'rejected'` |
| message | text | YES | |
| created_at / updated_at | timestamptz | NO | `now()` |

Used by `get_universal_feed` to enforce connection-scoped visibility (`status='accepted'`
either direction).

### 4.2 `blocked_users`

`blocker_id, blocked_id, reason, created_at`. Filtered into the feed via RLS / function.

---

## 5–8. Convene / Collaborate / Contribute / Communities

Detail in `docs/DNA-SUPABASE-SCHEMA-EXPORT.md` §2.3–§2.8. **None are touched by D054**;
they all read `profiles.id` only. Tables (one-line):

- **Convene:** `events` ⭐, `event_registrations`, `event_ticket_types`, `event_roles`,
  `event_checkins`, `event_comments`, `event_analytics`, plus 10+ ancillary.
- **Collaborate:** `spaces` ⭐, `space_members`, `space_tasks`, `space_updates`,
  `space_activity_log`, `space_attachments`, `space_roles`, `space_task_dependencies`,
  `space_templates`, plus legacy `collaboration_*` and `tasks`.
- **Contribute:** `opportunities` ⭐, `organizations`, `applications`,
  `contribution_needs`, `contribution_offers`, `contribution_acknowledgments`,
  `opportunity_*`, `organization_verification_requests`, `billing_transactions`,
  `platform_fees`, `sponsors`.
- **Communities & Groups:** `communities`, `community_memberships`, `community_posts`,
  `community_events`, `community_event_attendees`, `groups`, `group_members`,
  `group_messages`, `group_conversations`, `group_posts`, `group_post_comments`,
  `group_post_likes`, `group_join_requests`.

---

## 9. RLS — patterns relevant to D054

| Pattern | Used on | Logic |
|---|---|---|
| Owner-only | `profile_completion`, `user_onboarding_selections`, notification prefs | `auth.uid() = user_id` (or `= id`) |
| Owner write, public read | `profiles` (when `is_public=true`), `posts`, `events`, `communities` | INSERT/UPDATE `auth.uid() = author_id`; SELECT either `true` or a visibility predicate |
| Admin override | every table with admin write | `has_role(auth.uid(), 'admin')` via SECURITY DEFINER fn |
| Member access | `space_*`, `group_*`, `conversation_participants` | JOIN against membership table |
| Connection-based | DMs, introductions | `are_users_connected(u1, u2)` SECURITY DEFINER fn |

**For D054:** Both new pieces (`affirmations` table; the new `dna_role` / `dna_country_iso3` /
`dna_continent_id` columns on `profiles`) inherit the same shape — owner write,
controlled read. Detail in the plan doc §6.

---

## 10. ENUMS — current

From `types.ts` lines 11789–11849.

```text
app_role:                    user | moderator | admin
application_status:          pending | shortlisted | reviewing | accepted | rejected | withdrawn
attachment_type:             space | task | update
contribution_need_priority:  normal | high
contribution_need_status:    open | in_progress | fulfilled | closed
contribution_need_type:      funding | skills | time | access | resources
contribution_offer_status:   pending | accepted | declined | completed
contribution_type:           time | expertise | network | capital
event_format:                in_person | virtual | hybrid
event_type:                  conference | workshop | meetup | webinar | networking | social | other
group_join_policy:           open | approval_required | invite_only
group_member_role:           owner | admin | moderator | member
group_privacy:               public | private | secret
hashtag_status:              active | archived | suspended | reserved
hashtag_type:                community | personal
linked_entity_type:          event | space | need | story | community_post
opportunity_status:          draft | active | paused | closed | archived
opportunity_visibility:      public | network_only | private
reserved_category:           country | public_figure | company | government | offensive | system | trademark
rsvp_status:                 going | maybe | not_going | pending | waitlist
space_update_type:           manual_update | milestone | auto_task_event
task_status:                 open | in_progress | done
verification_status:         pending_verification | soft_verified | fully_verified
```

> Note: the older schema-export doc lists `verification_status` as also including
> `unverified` and `rejected`. The live enum per `types.ts` does **not**. The app
> appears to treat NULL as "unverified". D054 should confirm against the live DB
> before relying on any single source.

D054 adds **two new enums** (`dna_identity_role` — `returnee` | `anchor` | `ally` | `exploring`;
`dna_affirmation_type` — `arrival` | `ally_crossing` | `role_change` | `witness`). See
plan doc §A and §B.

---

## 11. Remaining tables — alphabetical catalog

One-line entries for every public-schema table not already detailed above; included so
this doc is a complete map. (Total public-schema tables observed in `types.ts`: ~189.)

**A** — `ada_cohort_memberships`, `ada_cohorts`, `ada_experiment_assignments`,
`ada_experiment_variants`, `ada_experiments`, `ada_policies`, `adin_contributor_requests`,
`adin_cost_tracking`, `adin_daily_stats`, `adin_nudges`, `adin_popular_queries`,
`adin_preferences`, `adin_recommendations`, `adin_signals`, `admin_activity_log`,
`alpha_feedback`, `analytics_events`, `applications`.

**B** — `badge_definitions`, `beta_waitlist`, `billing_transactions`.

**C** — `causes`, `collaboration_memberships`, `collaboration_spaces`, `comment_reactions`,
`comment_reports`, `comments`, `communities`, `community_event_attendees`,
`community_events`, `community_memberships`, `community_posts`, `content_flags`,
`content_moderation`, `contribution_acknowledgments`, `contribution_cards`,
`contribution_fulfillments`, `conversation_participants`, `conversations`,
`conversations_new`, `cron_job_logs`.

**D** — `dashboard_analytics`, `dia_insights`, `dia_queries`, `dia_query_log`,
`dia_user_usage`, `diaspora_data`.

**E** — `economic_indicators`, `entity_vectors`, `event_analytics`, `event_attendees`,
`event_blasts`, `event_checkins`, `event_comments`, `event_promo_codes`,
`event_registration_questions`, `event_registrations`, `event_reminder_logs`,
`event_reports`, `event_roles`, `event_ticket_holds`, `event_ticket_types`,
`event_tickets`, `event_waitlist`, `events`, `events_log`, `events_old`.

**F** — `feature_flags`, `feed_bookmarks`, `feed_comments`, `feed_engagement_events`,
`feed_reactions`, `feed_research_responses`, `feed_reshares`, `feedback_attachments`,
`feedback_channel_memberships`, `feedback_channels`, `feedback_messages`,
`feedback_reactions`.

**G** — `geographic_relevance`, `group_conversations`, `group_join_requests`,
`group_members`, `group_messages`, `group_post_comments`, `group_post_likes`,
`group_posts`, `groups`.

**H** — `hashtag_analytics`, `hashtag_followers`, `hashtag_usage_requests`, `hashtags`,
`hidden_posts`, `hub_metrics`.

**I** — `impact_attributions`, `impact_badges`, `impact_log`, `initiatives`,
`innovation_data`, `introductions`, `invites`.

**M** — `message_reactions`, `messages`, `messages_new`, `milestones`, `monthly_reports`,
`muted_authors`.

**N** — `newsletter_subscriptions`, `notifications`, `nudges`.

**O** — `opportunities`, `opportunity_applications`, `opportunity_bookmarks`,
`opportunity_contributions`, `opportunity_interests`, `organization_verification_requests`,
`organizations`.

**P** — `platform_fees`, `political_digest`, `post_analytics`, `post_bookmarks`,
`post_comments`, `post_hashtags`, `post_likes`, `post_reactions`, `post_reports`,
`post_shares`, `post_views`, `profile_causes`, `profile_skills`, `profile_views`,
`projects`, `project_contributions`, `provinces`, `public_profiles` (view), `push_subscriptions`.

**R** — `rate_limit_checks`, `release_features`, `releases`, `reserved_hashtags`,
`roadmap_subscribers`.

**S** — `saved_posts`, `search_preferences`, `skill_analytics`, `skill_connections`,
`skills`, `space_activity_log`, `space_attachments`, `space_members`, `space_roles`,
`space_task_dependencies`, `space_tasks`, `space_templates`, `space_updates`, `spaces`,
`sponsor_placements`, `sponsors`.

**T** — `task_comments`, `tasks`.

**U** — `user_adin_profile`, `user_badges`, `user_communities`, `user_connections`,
`user_dashboard_preferences`, `user_dna_points`, `user_engagement_tracking`,
`user_feedback`, `user_follows`, `user_impact_summary`, `user_interactions`,
`user_last_view_state`, `user_recommendations`, `user_vectors`, `username_history`,
`users`.

**V** — `verified_contributors`.

**W** — `waitlist_signups`.

---

## 12. Storage buckets (per schema export, 2026-03-09)

| Bucket | Public | Size limit | Allowed types |
|---|---|---|---|
| `avatars` | ✅ | — | any |
| `banners` | ✅ | — | any |
| `event-images` | ✅ | 10 MB | image/*, video/* |
| `event-media` | ✅ | — | any |
| `feedback-media` | ✅ | — | any |
| `message-attachments` | ✅ | — | any |
| `messages` | ✅ | 50 MB | image/*, audio/*, video/*, pdf |
| `organization-logos` | ✅ | 5 MB | image/* |
| `post-media` | ✅ | 10 MB | image/*, video/*, pdf, docx |
| `profile-images` | ✅ | 5 MB | image/* |
| `profile-pictures` | ✅ | 5 MB | image/* |
| `space-attachments` | ❌ | — | any |
| `story-hero-images` | ✅ | — | any |
| `user-posts` | ✅ | 10 MB | image/*, video/* |

No D054 impact (no new bucket needed for affirmations at v0.0 — text-only declaration).

---

## 13. Open questions that need a live-DB query before D054 SQL is finalized

1. Is `verification_status` really three-valued or five-valued today? (Conflict between
   `types.ts` enum and the older schema export.)
2. Are the FKs from `profiles.current_country_id` / `profiles.country_of_origin_id` to
   `countries.id` actually declared in the live DB? `types.ts` does not list them under
   the `profiles` Relationships, but onboarding and admin code treats them as if they exist.
3. Is there a `CHECK` constraint on `profiles.user_type` today, and if so, what is its
   exact value list? (Onboarding writes one of `individual` / `organization` /
   `diaspora_professional` / `founder` / `ally`; older schema export said default `'member'`.)
4. Is there a UNIQUE index on `countries.country_code_iso3`? If yes, D054's new
   `dna_country_iso3` column can be a hard FK; if no, the plan stays with a CHECK regex.

These should be verified with a read-only `\d+` and `pg_constraint` query in the next
planning cycle before authoring the D054 migration SQL.

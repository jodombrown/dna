# DNA Supabase Backend — Current Schema Inventory

**Derived from:** Auto-generated `types.ts` + 727 committed migrations  
**Commit SHA:** e1cdc66  
**Supabase Project Ref:** ybhssuehmfnxrzneobok  
**Generated:** 2026-05-21

---

## Overview

This is a **static schema inventory** derived from committed source files:
- `/src/integrations/supabase/types.ts` (12,040 lines) — auto-generated from the live DB schema, the SOURCE OF TRUTH
- `/supabase/migrations/*.sql` (727 files) — committed migration history for defaults, constraints, and FK behavior

**This is NOT a live `information_schema` query.** It reflects the committed schema as of this commit. It cannot tell you row counts, current RLS policies in effect, runtime-added indexes, or modified defaults. For authoritative runtime state, query the live Supabase project with service-role credentials.

---

## Tables (public schema)

**Total: 189 public schema tables**

Listed below in alphabetical order. For each table: column count, primary key(s), and key foreign key references.

| Table | Columns | Notes |
|-------|---------|-------|
| ada_cohort_memberships | 6 | PK: id; FK: cohort_id → ada_cohorts |
| ada_cohorts | 8 | PK: id; JSON: criteria |
| ada_experiment_assignments | 6 | PK: id; FK: experiment_id → ada_experiments, variant_id → ada_experiment_variants |
| ada_experiment_variants | 8 | PK: id; FK: experiment_id → ada_experiments; JSON: config |
| ada_experiments | 12 | PK: id; JSON: config |
| ada_policies | 10 | PK: id |
| adin_contributor_requests | 13 | PK: id |
| adin_cost_tracking | 57 | PK: id; Complex metrics table |
| adin_daily_stats | 52 | PK: id; Analytics aggregations |
| adin_nudges | 10 | PK: id |
| adin_popular_queries | 45 | PK: id |
| adin_preferences | 21 | PK: id |
| adin_recommendations | 9 | PK: id |
| adin_signals | 13 | PK: id |
| admin_activity_log | 8 | PK: id; audit trail |
| alpha_feedback | 10 | PK: id; user feedback |
| analytics_events | 7 | PK: id; event tracking |
| applications | 9 | PK: id; opportunity applications |
| badge_definitions | 10 | PK: id; achievement badges |
| beta_waitlist | 9 | PK: id; beta signup queue |
| billing_transactions | 13 | PK: id; payment records |
| blocked_users | 6 | PK: id; blocking relationships |
| causes | 7 | PK: id; cause/SDG tags |
| collaboration_memberships | 7 | PK: id; space participation |
| collaboration_spaces | 11 | PK: id; collaborative workspaces |
| comment_reactions | 6 | PK: id; emoji reactions |
| comment_reports | 10 | PK: id; moderation |
| comments | 9 | PK: id; nested discussions |
| communities | 20 | PK: id; community groups |
| community_event_attendees | 6 | PK: id; event RSVP |
| community_events | 17 | PK: id; community events |
| community_memberships | 10 | PK: id; community participation |
| community_posts | 13 | PK: id; community content |
| connections | 8 | PK: id; connection requests |
| content_flags | 10 | PK: id; content moderation |
| content_moderation | 10 | PK: id; moderation decisions |
| **continents** | 6 | PK: id; **Geographic reference** |
| contribution_acknowledgments | 9 | PK: id; recognition |
| contribution_cards | 15 | PK: id; contribution needs display |
| contribution_fulfillments | 13 | PK: id; matching offers to needs |
| contribution_needs | 18 | PK: id; contribution requests |
| contribution_offers | 11 | PK: id; contribution offers |
| conversation_participants | 6 | PK: id; messaging participants |
| conversations | 14 | PK: id; legacy 1:1 DMs |
| conversations_new | 13 | PK: id; unified messaging |
| **countries** | 30 | PK: id; FK: region_id → regions; **Geographic reference** |
| cron_job_logs | 11 | PK: id; scheduled job logs |
| dashboard_analytics | 9 | PK: id; dashboard metrics |
| dia_insights | 15 | PK: id; diaspora insights |
| dia_queries | 14 | PK: id; diaspora research queries |
| dia_query_log | 8 | PK: id; query history |
| dia_user_usage | 11 | PK: id; diaspora mode usage |
| diaspora_data | 16 | PK: id; diaspora metadata |
| economic_indicators | 13 | PK: id; economic data |
| entity_vectors | 9 | PK: id; vector embeddings |
| error_logs | 12 | PK: id; application errors |
| event_analytics | 6 | PK: id; event metrics |
| event_attendees | 13 | PK: id; attendance tracking |
| event_blasts | 8 | PK: id; mass messaging |
| event_checkins | 5 | PK: id; attendance verification |
| event_comments | 8 | PK: id; event discussions |
| event_promo_codes | 12 | PK: id; discount codes |
| event_registration_questions | 9 | PK: id; dynamic form questions |
| event_registrations | 15 | PK: id; ticket/registration records |
| event_reminder_logs | 8 | PK: id; notification history |
| event_reports | 10 | PK: id; post-event analytics |
| event_roles | 8 | PK: id; speaker/organizer roles |
| event_ticket_holds | 8 | PK: id; reserved inventory |
| event_ticket_types | 15 | PK: id; ticket definitions |
| event_tickets | 15 | PK: id; individual tickets |
| event_waitlist | 6 | PK: id; waitlist queue |
| **events** | 43 | PK: id; FK: organizer_id → profiles; **Major table** |
| events_log | 6 | PK: id; event history |
| events_old | 25 | PK: id; legacy events |
| feature_flags | 6 | PK: id; feature toggling |
| feed_bookmarks | 6 | PK: id; saved content |
| feed_comments | 9 | PK: id; feed discussions |
| feed_engagement_events | 12 | PK: id; engagement tracking |
| feed_reactions | 7 | PK: id; likes/reactions |
| feed_research_responses | 17 | PK: id; survey responses |
| feed_reshares | 7 | PK: id; repost/share tracking |
| feedback_attachments | 8 | PK: id; file attachments |
| feedback_channel_memberships | 8 | PK: id; channel access |
| feedback_channels | 10 | PK: id; feedback channels |
| feedback_messages | 19 | PK: id; feedback messages |
| feedback_reactions | 6 | PK: id; message reactions |
| geographic_relevance | 9 | PK: id; geo-tagging |
| group_conversations | 6 | PK: id; group messaging |
| group_join_requests | 9 | PK: id; group invitations |
| group_members | 11 | PK: id; group membership |
| group_messages | 7 | PK: id; group DMs |
| group_post_comments | 8 | PK: id; group post replies |
| group_post_likes | 5 | PK: id; group post reactions |
| group_posts | 12 | PK: id; group content |
| groups | 19 | PK: id; user groups/circles |
| hashtag_analytics | 9 | PK: id; hashtag usage metrics |
| hashtag_followers | 5 | PK: id; hashtag followers |
| hashtag_usage_requests | 10 | PK: id; hashtag usage approval |
| hashtags | 17 | PK: id; hashtag definitions |
| hidden_posts | 5 | PK: id; hidden content tracking |
| hub_metrics | 13 | PK: id; hub/region metrics |
| impact_attributions | 8 | PK: id; impact source tracking |
| impact_badges | 9 | PK: id; achievement badges |
| impact_log | 13 | PK: id; impact event log |
| initiatives | 16 | PK: id; projects/initiatives |
| innovation_data | 16 | PK: id; innovation metrics by country |
| introductions | 11 | PK: id; user introductions |
| invites | 11 | PK: id; signup invitations |
| message_reactions | 6 | PK: id; DM reactions |
| messages | 8 | PK: id; legacy DMs |
| messages_new | 15 | PK: id; unified message records |
| milestones | 15 | PK: id; project milestones |
| monthly_reports | 15 | PK: id; regional monthly data |
| muted_authors | 5 | PK: id; mute relationships |
| newsletter_subscriptions | 10 | PK: id; email subscriptions |
| notifications | 12 | PK: id; user notifications |
| nudges | 12 | PK: id; engagement nudges |
| opportunities | 15 | PK: id; opportunities/needs |
| opportunity_applications | 16 | PK: id; applications to opportunities |
| opportunity_bookmarks | 5 | PK: id; saved opportunities |
| opportunity_contributions | 15 | PK: id; matched contributions |
| opportunity_interests | 8 | PK: id; interest signaling |
| organization_verification_requests | 22 | PK: id; org KYC |
| **organizations** | 30 | PK: id; FK: country_id → countries, owner_user_id → users; **Major table** |
| platform_fees | 10 | PK: id; fee records |
| political_digest | 13 | PK: id; political news |
| post_analytics | 14 | PK: id; post metrics |
| post_bookmarks | 7 | PK: id; saved posts |
| post_comments | 16 | PK: id; nested comments |
| post_hashtags | 5 | PK: id; post-tag linking |
| post_likes | 5 | PK: id; like tracking |
| post_reactions | 6 | PK: id; emoji reactions |
| post_reports | 10 | PK: id; abuse reports |
| post_shares | 6 | PK: id; share tracking |
| post_views | 5 | PK: id; view tracking |
| **posts** | 39 | PK: id; FK: author_id → profiles; **Major table** |
| profile_causes | 4 | PK: id; cause affiliations |
| profile_completion | 7 | PK: id; onboarding progress |
| profile_skills | 4 | PK: id; skill associations |
| profile_views | 7 | PK: id; profile visitor tracking |
| **profiles** | 210 | PK: id (FK → auth.users); FK: country_of_origin_id, current_country_id → countries; **CENTRAL TABLE — D054 focus** |
| project_contributions | 11 | PK: id; contribution tracking |
| projects | 9 | PK: id; project records |
| **provinces** | 9 | PK: id; FK: country_id → countries; **Geographic reference** |
| public_profiles | 39 | PK: id; denormalized public view |
| push_subscriptions | 8 | PK: id; push notification subscriptions |
| rate_limit_checks | 5 | PK: id; rate limit tracking |
| **regions** | 21 | PK: id; FK: continent_id → continents; **Geographic reference** |
| release_features | 6 | PK: id; release tracking |
| releases | 24 | PK: id; version releases |
| reserved_hashtags | 8 | PK: id; reserved/protected hashtags |
| saved_posts | 5 | PK: id; post saves |
| search_preferences | 7 | PK: id; user search history |
| skill_analytics | 7 | PK: id; skill usage metrics |
| skill_connections | 7 | PK: id; skill-based connections |
| skills | 5 | PK: id; skill definitions |
| space_activity_log | 9 | PK: id; space activity audit |
| space_attachments | 11 | PK: id; file attachments |
| space_members | 9 | PK: id; space membership |
| space_roles | 10 | PK: id; space role definitions |
| space_task_dependencies | 4 | PK: id; task dependencies |
| space_tasks | 17 | PK: id; task records |
| space_templates | 13 | PK: id; space templates |
| space_updates | 7 | PK: id; space updates |
| **spaces** | 27 | PK: id; **Collaboration/workspace table** |
| sponsor_placements | 15 | PK: id; sponsorship placements |
| sponsors | 13 | PK: id; sponsor records |
| task_comments | 7 | PK: id; task discussions |
| **tasks** | 20 | PK: id; FK: assignee_id → profiles; **Task management** |
| user_adin_profile | 14 | PK: id; diaspora insights profile |
| user_badges | 5 | PK: id; badge awards |
| **user_communities** | 10 | PK: id; FK: owner_id → users; user community ownership |
| user_connections | 5 | PK: id; follow relationships |
| user_dashboard_preferences | 6 | PK: id; dashboard customization |
| user_dna_points | 8 | PK: id; gamification points |
| user_engagement_tracking | 14 | PK: id; engagement metrics |
| user_feedback | 10 | PK: id; user feedback |
| user_follows | 5 | PK: id; follower/following |
| user_impact_summary | 724 | PK: id; denormalized impact metrics (WIDE TABLE) |
| user_interactions | 10 | PK: id; interaction log |
| user_last_view_state | 5 | PK: id; UI state persistence |
| user_onboarding_selections | 8 | PK: id; onboarding choices |
| user_recommendations | 12 | PK: id; recommendation engine |
| **user_roles** | 6 | PK: id; FK: user_id → users; UNIQUE(user_id, role); **Platform role assignment** |
| user_vectors | 7 | PK: id; embedding vectors |
| username_history | 6 | PK: id; username change tracking |
| **users** | 15 | PK: id; role column (denormalized); **Supplementary user table (prefer profiles)** |
| verified_contributors | 7 | PK: id; verified user flags |
| waitlist_signups | 10 | PK: id; waitlist queue |

---

## Foreign Keys to auth.users

**Count: 1 direct FK from public schema to auth.users**

- **`profiles.id`** → `auth.users.id` (ON DELETE CASCADE)
  - Primary link between platform user and authentication system
  - Every auth user should have a corresponding profiles row (ensured by trigger)

**Count: 2 FKs from public schema to public.users table** (different from auth.users):
- **`communities.created_by`** → `users.id`
- **`user_communities.owner_id`** → `users.id`

**Note:** The `users` table appears to be supplementary/legacy. Primary user context lives in `profiles`.

---

## D054-Relevant Detail

### 1. Profiles Table — Role & User Type Columns

#### Existing Role/Type Columns:

**1.1 `user_type` (TEXT, nullable)**
- Check constraint enforced:
  ```sql
  CHECK (user_type IN ('diaspora_professional', 'founder', 'ally'))
  ```
- Added in migration `20250805042946_4271ba21-b3cc-4c83-b506-8ea49f9f0b26.sql`
- Three discrete user categories for the diaspora context

**1.2 `roles` (TEXT[], nullable)**
- Array of role strings (NOT a direct FK to user_roles)
- Denormalized from user_roles table for convenience in queries
- Migration `20250704020955` shows that a prior `user_role` column was **dropped** from profiles
- User roles are now managed separately in the `user_roles` junction table (see below)

**1.3 `professional_role` (TEXT, nullable)**
- Job title/career role, not a platform role
- Example: 'Senior Product Manager', 'Founder', 'Student'

#### User Roles Management (Separate Table):

- **Table:** `user_roles`
  ```sql
  CREATE TABLE public.user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      role app_role NOT NULL,
      UNIQUE (user_id, role)
  );
  ```
- **Enum:** `app_role` = `('user', 'moderator', 'admin')`
- **Function:** `has_role(_user_id uuid, _role app_role)` → checks if user holds role
- **Relationship:** Junction table linking users to platform roles (admin, moderator, user)
- Users can hold multiple roles (enforced by UNIQUE constraint on user_id + role)

---

### 2. Profiles Table — Geographic Columns

#### 2.1 Country/Origin Columns:
- **`country_of_origin`** (TEXT, nullable) — Plain text (e.g., 'Nigeria', 'Ghana')
- **`country_of_origin_id`** (UUID, nullable) — FK → `countries.id`
- **`country_origin`** (TEXT, nullable) — Appears to be duplicate; added in migration `20250801062316_57e6f3d5-6b74-4d60-beee-4f1b8633ad3a.sql` with comment: "User's country of origin (e.g. Nigeria, Ghana)"

#### 2.2 Current Location Columns:
- **`current_country`** (TEXT, nullable)
- **`current_country_code`** (TEXT, nullable)
- **`current_country_id`** (UUID, nullable) — FK → `countries.id`
- **`current_country_name`** (TEXT, nullable) — Denormalized copy of countries.name
- **`current_city`** (TEXT, nullable)
- **`current_region`** (TEXT, nullable) — Region name or code
- **`current_location`** (TEXT, nullable) — Free-text: 'Lagos, Nigeria'

#### 2.3 Generic Location Columns:
- **`location`** (TEXT, nullable) — Generic location field
- **`city`** (TEXT, nullable)
- **`location_preference`** (TEXT, nullable)
- **`origin_country_code`** (TEXT, nullable)
- **`origin_country_name`** (TEXT, nullable) — Denormalized

#### 2.4 Region/Continent-Related:
- **`impact_regions`** (TEXT[], nullable) — Array of region names/IDs where user drives impact
- **`regional_expertise`** (TEXT[], nullable) — Regions of professional expertise
- **`region_tags`** (JSON, nullable) — Structured region metadata

#### 2.5 Africa-Specific Columns:
- **`africa_focus_areas`** (TEXT[], nullable) — African regions/sectors of user's focus
- **`africa_visit_frequency`** (TEXT, nullable) — e.g., 'annually', 'quarterly', 'never'
- **`african_causes`** (TEXT[], nullable)

#### 2.6 Diaspora Context Columns:
- **`diaspora_origin`** (TEXT, nullable) — Origin diaspora identifier (e.g., 'nigerian-diaspora', 'ghanaian-diaspora')
- **`diaspora_status`** (TEXT, nullable) — Lifecycle state: 'in-diaspora' | 'returning' | 'potential'
- **`years_in_diaspora`** (NUMBER, nullable) — Numeric duration (e.g., 15 years)
- **`years_in_diaspora_text`** (TEXT, nullable) — Text representation
- **`diaspora_networks`** (TEXT[], nullable) — Array of diaspora network identifiers

#### 2.7 Timezone:
- **`timezone`** (TEXT, nullable) — IANA timezone string (e.g., 'Africa/Lagos', 'America/New_York')

---

### 3. Geographic Reference Tables (3-Level Hierarchy)

#### 3.1 **continents** (6 columns)
- **Columns:** id (PK), name, description, created_at, updated_at
- **Purpose:** Top-level geographic hierarchy
- **Relationships:** Referenced by regions.continent_id

#### 3.2 **regions** (21 columns)
- **Columns:** id (PK), name, continent_id (FK), description, description_short, description_full, region_code, region_slug, hero_image_url, map_coordinates (JSON), timezone_primary, languages_primary (array), diaspora_population_estimate, interest_tags, key_sectors, skill_relevance, status, tagline, created_at, updated_at
- **Purpose:** Sub-continental regions (e.g., 'West Africa', 'East Africa', 'Southern Africa')
- **Relationships:** FK → continents; referenced by countries

#### 3.3 **countries** (30 columns)
- **Columns:** id (PK), name, region_id (FK), country_code_iso2, country_code_iso3, iso_code, country_slug, population, gdp_usd, gdp_growth_rate, diaspora_population_estimate, diaspora_top_destinations (array), capital, capital_coordinates (JSON), currency_code, official_languages (array), flag_url, hero_image_url, timezone, description, description_short, description_full, tagline, interest_tags, key_sectors, skill_relevance, status, created_at, updated_at
- **Purpose:** Country-level reference data with diaspora-specific metadata
- **Relationships:** FK → regions; referenced by profiles (country_of_origin_id, current_country_id), organizations (country_id), and others
- **Diaspora Fields:** diaspora_population_estimate, diaspora_top_destinations
- **Key Fields:** country_code_iso2 (e.g., 'NG'), country_code_iso3 (e.g., 'NGA'), country_slug (e.g., 'nigeria')

#### 3.4 **provinces** (9 columns)
- **Columns:** id (PK), country_id (FK), name, province_code, description, created_at, updated_at, and 2 others
- **Purpose:** Sub-national divisions (states, provinces)
- **Relationships:** FK → countries

---

### 4. Affirmations / Witness / Endorsement Tables

**Finding:** **NO** affirmations, witness, vouch, endorsement, attestation, or commendation tables currently exist in the schema.

**Searched for:** `affirmation*`, `witness*`, `vouch*`, `endorsement*`, `attestation*`, `commendation*`, `validate*`  
**Result:** None found in types.ts or committed migrations.

**Implication for D054:** If affirmation/witness functionality is required, a new table must be created. Currently, all endorsement/credibility tracking appears to be handled through the `verified_contributors` table and `verification_status` enum on profiles.

---

### 5. Enum Types

Defined enums in public schema (from types.ts Enums section):

- **`app_role`**: 'user', 'moderator', 'admin'
- **`verification_status`**: 'pending_verification', 'soft_verified', 'fully_verified'
- **`application_status`**: 'pending', 'shortlisted', 'reviewing', 'accepted', 'rejected', 'withdrawn'
- **`contribution_need_priority`**: 'normal', 'high'
- **`contribution_need_status`**: 'open', 'in_progress', 'fulfilled', 'closed'
- **`contribution_need_type`**: 'funding', 'skills', 'time', 'access', 'resources'
- **`contribution_offer_status`**: 'pending', 'accepted', 'declined', 'completed'
- **`contribution_type`**: 'time', 'expertise', 'network', 'capital'
- **`event_format`**: 'in_person', 'virtual', 'hybrid'
- **`event_type`**: 'conference', 'workshop', 'meetup', 'webinar', 'networking', 'social', 'other'
- **`group_join_policy`**: 'open', 'approval_required', 'invite_only'
- **`group_member_role`**: 'owner', 'admin', 'moderator', 'member'
- **`group_privacy`**: 'public', 'private', 'secret'
- **`hashtag_status`**: 'active', 'archived', 'suspended', 'reserved'
- **`hashtag_type`**: 'community', 'personal'
- **`linked_entity_type`**: 'event', 'space', 'need', 'story', 'community_post'
- **`opportunity_status`**: 'draft', 'active', 'paused', 'closed', 'archived'
- **`opportunity_visibility`**: 'public', 'network_only', 'private'
- **`reserved_category`**: 'country', 'public_figure', 'company', 'government', 'offensive', 'system', 'trademark'
- **`rsvp_status`**: 'going', 'maybe', 'not_going', 'pending', 'waitlist'
- **`space_update_type`**: 'manual_update', 'milestone', 'auto_task_event'
- **`task_status`**: 'open', 'in_progress', 'done'

---

## Caveats

This inventory is a **static snapshot** derived from committed source files. It cannot tell you:

- **Row counts or cardinality** — requires live `SELECT COUNT(*)` queries
- **Current RLS policies in effect** — defined in migrations but may have been altered at runtime
- **Indexes** — only those created via migrations are tracked; ad-hoc indexes added via Supabase console are not captured
- **Runtime-modified defaults** — DEFAULT clauses in migrations may differ from current runtime state due to ALTER TABLE commands not fully tracked
- **Actual column order** — types.ts may reorder columns during auto-generation
- **Computed or generated columns** — not fully represented in types.ts
- **Current constraint state** — CHECK/UNIQUE constraints defined in migrations but altered since are not captured
- **Materialized views or view definitions** — only base tables are inventoried
- **Supabase-managed metadata** (storage buckets, function logs, JWT secrets)
- **Live performance metrics** (query plans, slow queries, index utilization, table bloat)

**For authoritative runtime information,** query the live Supabase project's `information_schema` or consult the Supabase management API with service-role credentials.


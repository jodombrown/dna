# DNA — Diaspora Network of Africa: Current State Audit

**Prepared by:** Claude Code (working in the DNA repo, branch `claude/dna-codebase-audit-f94Q9`)
**Repo:** `jodombrown/dna`
**Audit date:** 2026-05-18
**Latest commit at audit:** `e1cdc66` (Merge PR #132 — dia-room-reasoning edge function)
**Audience:** External AI thought partner helping architect DNA's next-phase product.

> Style note: I have been brutally honest. Anywhere a feature is half-built, abandoned, or stubbed, I say so. Where I can't verify something from code alone (real user counts, revenue, live ops state), I flag it explicitly.

---

## Section 1 — Repository and Tech Stack

### Repository structure (top level)

```
/home/user/dna
├── .lovable/               Lovable platform metadata (Lovable is the AI dev tool that scaffolded this)
├── audit-reports/          Older audit JSON/MD output
├── docs/                   ~80 PRDs, audits, architecture notes, sprint plans (very dense)
├── public/                 Static assets (favicon, manifest.json, sw.js, sw-push.js, icons, patterns, lovable-uploads)
├── scripts/                Database seeding utilities (seed-database.ts, seed-test-profiles/)
├── src/
│   ├── App.tsx             Root component: ~820 lines, all routes declared inline (huge route table)
│   ├── main.tsx            Entry
│   ├── index.css           Global tokens + CSS variables for DNA brand colors
│   ├── assets/             Bundled images (logo, hero, patterns)
│   ├── components/         76 feature folders + 61 shared ui/ primitives (shadcn)
│   ├── config/             featureFlags.ts, partnerContent, partnerSectors, etc.
│   ├── contexts/           AuthContext, ViewStateContext, MessageContext, AccountDrawerContext, DashboardContext, SocialFeedContext
│   ├── data/               Static data (countries, regions, etc.)
│   ├── hooks/              113 custom hooks
│   ├── integrations/supabase/  client.ts + types.ts (12,040 lines auto-generated)
│   ├── layouts/            BaseLayout, TwoColumnLayout, etc.
│   ├── lib/                config, queryClient, typography.config, errorLogger, feedAnalytics, etc.
│   ├── pages/              ~120 page components organized by surface (dna/, africa/, admin/, _archived/, features/, documentation/, releases/)
│   ├── routes/             Smaller route helpers
│   ├── scripts/            One-off TS scripts
│   ├── services/           50+ service modules (feedService, messageService, dia/, ada/, etc.)
│   ├── styles/             enhanced-interactions.css
│   ├── types/              Domain TypeScript types (feed, dia, composer, events, messaging)
│   └── utils/              Misc utilities (haptics, etc.)
├── supabase/
│   ├── config.toml         Project ID: `ybhssuehmfnxrzneobok`
│   ├── functions/          43 Deno edge functions + _shared/cors.ts + deno.json
│   └── migrations/         727 SQL migration files (Dec 2024 → May 2026)
├── package.json            Vite + React 18 + TS scaffold (Lovable-generated)
├── tailwind.config.ts      Custom DNA color/pattern tokens
├── components.json         shadcn/ui config
├── index.html
└── ~50 root-level Markdown audit / sprint / phase docs   (e.g. AUDIT_REPORT.md, DNA_Platform_Audit_FINAL.md, PHASE_COMPLETION_REPORT.md, etc.)
```

Counts (verified): **1,410 `.ts`/`.tsx` files in `src/`**, **182 directories**, **727 migrations**, **43 edge functions**, **~50 root-level docs + ~80 in `/docs`**.

### Frontend

- **Framework:** React 18.3.1
- **Build tool:** Vite 5.4 with `@vitejs/plugin-react-swc`
- **Language:** TypeScript 5.5
- **Routing:** `react-router-dom` 7.13 (declared as v7 in package, but used in v6 idioms — `BrowserRouter`/`Routes`/`Route` with element prop)
- **Styling:** Tailwind CSS 3.4 + `tailwindcss-animate` + custom DNA tokens; `@tailwindcss/typography` for rich text
- **UI primitives:** shadcn/ui on top of Radix UI (24 Radix packages in deps — Accordion, AlertDialog, Avatar, Dialog, DropdownMenu, NavigationMenu, Popover, ScrollArea, Select, Tabs, Toast, Tooltip, etc.)
- **State:**
  - `@tanstack/react-query` 5.56 — server state (centralized config in `src/lib/queryClient.ts` with explicit STALE_TIMES per data class)
  - `zustand` 5.0 — client state (small footprint)
  - React Context for auth/view/message/account drawer
- **Forms:** `react-hook-form` 7.53 + `zod` 3.23 + `@hookform/resolvers`
- **Animation:** `framer-motion` 12.23, `embla-carousel-react`, `tailwindcss-animate`, `canvas-confetti`
- **Tables/Calendars:** `react-big-calendar`, `react-day-picker`
- **Maps:** `leaflet` + `react-leaflet` (used on Roadmap event page)
- **Mobile-ish UX:** `vaul` 0.9.3 (bottom sheets), `emoji-picker-react`, `input-otp`
- **Rich text:** custom RichTextEditor in `src/components/convey/RichTextEditor.tsx` + `dompurify` for sanitization
- **Media:** `react-easy-crop`, `html2canvas`, `jspdf`, `ics` (ICS calendar export), `qrcode` + `@zxing/browser` (QR check-in)
- **Drag and drop:** `@dnd-kit/core` + `@dnd-kit/sortable` (collaboration Kanban board)
- **Misc:** `date-fns` 4, `moment` (legacy), `recharts`, `sonner`, `next-themes`, `react-helmet-async`, `react-error-boundary`, `uuid`

### Backend / data plane

- **BaaS:** Supabase (single project, ID `ybhssuehmfnxrzneobok`, region not visible in code). PostgreSQL 15.
- **Auth:** Supabase Auth — email/password (primary) + LinkedIn OIDC (`provider: 'linkedin_oidc'` in `src/pages/Auth.tsx:80`). No magic-link UI but a `send-magic-link` edge function exists.
- **Storage:** Supabase Storage (50MiB file limit per `config.toml`). Used for avatars, banners, post media, intro audio/video.
- **Realtime:** Supabase Realtime; `realtime.params.eventsPerSecond: 10` in client (`src/integrations/supabase/client.ts`). Scoped subscriptions for unread/badge/groups (recent fixes: PR #129, #130).
- **Edge functions:** Deno runtime, 43 functions (catalogued in §9).
- **Row-Level Security:** RLS extensively used. Migrations contain **~4,113 occurrences of `policy`/`POLICY`** across the 727 migration files. The codebase has security audit docs that flag broken RLS in groups (`docs/SECURITY-AUDIT-GROUPS.md`).

### Hosting

- **Frontend:** Hosted via Lovable (the AI builder platform) — domain `https://diasporanetwork.africa` (set as default in `src/lib/config.ts`). Lovable's project URL is referenced in README: `https://lovable.dev/projects/866bbb52-dc1d-4eb7-807c-62f17d69e56e`.
- **Backend:** Supabase managed (project `ybhssuehmfnxrzneobok.supabase.co`).
- **Staging URL:** Not implemented as a separate URL in code; Lovable hosts a preview but no explicit staging env is set up here.
- **CDN:** Whatever Lovable provisions; not configured in repo.

### Mobile deployment

- **Not implemented.** No Capacitor, no React Native, no native iOS/Android shells. There is a PWA manifest (`public/manifest.json`) and two service workers (`public/sw.js`, `public/sw-push.js`) which enable installability and Web Push. No App Store / Play Store presence in the codebase.

### CI/CD

- **No GitHub Actions workflows** in the repo (no `.github/workflows/`). No Vercel, Netlify, or Fly configs.
- Pushes to `main` are picked up by Lovable's auto-deploy. Branches like `claude/...` are spawned by AI assistants and merged via PR.
- ESLint runs only locally (`npm run lint`); there's no enforcement on PR.
- No test suite at all — no Vitest/Jest/Playwright config, no `__tests__`, no `*.test.ts(x)` files.

### Major libraries (purpose summary)

| Lib | Used for |
|---|---|
| `@supabase/supabase-js` | All data access, auth, storage, realtime, function invocation |
| `@tanstack/react-query` | Server-state caching, infinite queries (feed) |
| `react-hook-form` + `zod` | Form state + validation (composer, profile edit, event creation, onboarding) |
| `framer-motion` | Page transitions, manifesto scroll, hero animations |
| `lucide-react` | All iconography (no custom icon system) |
| `recharts` | Admin analytics dashboards |
| `react-router-dom` | Client routing |
| `vaul` | Mobile bottom-sheet drawer (composer + filters) |
| `leaflet` / `react-leaflet` | Map view (Roadmap event location, event location preview) |
| `qrcode` / `@zxing/browser` | Event check-in (generate + scan) |
| `ics` | Add-to-calendar export |
| `dompurify` | Sanitize user-generated HTML (Convey stories) |
| `embla-carousel-react` | Carousels (stats, testimonials, marketing) |
| `react-big-calendar` | Convene calendar view (`EventCalendarView`) |
| `@dnd-kit/*` | Kanban board (Collaborate, when present) |
| `react-leaflet` | Map components |
| `next-themes` | Theme provider (dark mode declared but app defaults to light) |
| `sonner` + `@radix-ui/react-toast` | Toast notifications (both, redundantly) |
| `react-helmet-async` | SEO meta tags |
| `lovable-tagger` (dev) | Lovable component tagging plugin in dev mode |

### Third-party services in use

| Service | Where | Status |
|---|---|---|
| **Supabase** | All data, auth, storage, realtime, functions | Primary backend |
| **Stripe** | `create-payment`, `verify-payment`, `stripe-webhook` edge functions; event ticketing only | Configured; event-payment flow exists but completeness uncertain |
| **Resend** | `send-universal-email`, `send-welcome-email`, `send-notification-email`, `send-magic-link`, `send-event-blasts`, `send-event-reminders`, `send-newsletter`, `send-password-reset`, `send-contact-email`, `unsubscribe-email`, `send-survey-response` edge functions | Live; emails come from `welcome@diasporanetwork.africa` |
| **Perplexity API** | `dia-search`, `dia-room-reasoning`, `curate-diaspora-events`, `global-search` edge functions | Used for outside-world knowledge (news, events, trend data) |
| **OpenAI** | `ai-search`, `transcribe-voice`, `curate-diaspora-events` edge functions | Whisper transcription + intent analysis |
| **Lovable AI Gateway** | `suggest-usernames`, `get-event-recommendations` (via `https://ai.gateway.lovable.dev`) | Used in place of direct vendor for some calls; routes through `LOVABLE_API_KEY` |
| **Google Gemini** | Through Lovable gateway with `model: 'google/gemini-2.5-flash'` for username/event recs | Indirect |
| **Twilio / SendGrid / Algolia / Mixpanel / PostHog / Sentry / Datadog** | Not implemented |

### AI services — concrete inventory

- **OpenAI direct:** `gpt-4o-mini` for intent analysis (`ai-search/index.ts`), Whisper-1 for voice transcription (`transcribe-voice/index.ts`).
- **Perplexity direct:** `sonar` and `llama-3.1-sonar-small-128k-online` models for grounded search/curation (`dia-search`, `dia-room-reasoning`, `curate-diaspora-events`, `global-search`).
- **Lovable AI gateway (proxy):** `google/gemini-2.5-flash` for username suggestions and event recommendations.
- **No Anthropic / Claude API integration** anywhere in the production code path. (Anthropic Claude is the tool building this audit, but not wired into the product.)

See §9 for data-flow detail.

### Deployment status

- **Live URL (per code):** `https://diasporanetwork.africa` (set in `src/lib/config.ts`).
- I cannot verify from inside the repo whether that domain is currently serving the latest build, or what its actual uptime/state is.
- **Environments:** Only one production-style environment is configured. There is no `.env.staging` / `.env.production` separation; environment switching happens through Lovable's preview vs. publish.

---

## Section 2 — Data Model

### Headline numbers

- **~330 Postgres tables, views, and RPC functions** are surfaced in `src/integrations/supabase/types.ts` (12,040 lines auto-generated). I counted **160+ user-data tables** + the rest as views and RPCs.
- **15 enums** declared (`app_role`, `application_status`, `attachment_type`, `contribution_need_priority`, `contribution_need_status`, `contribution_need_type`, `contribution_offer_status`, `contribution_type`, `event_format`, `event_type`, `group_join_policy`, `group_member_role`, `group_privacy`, `hashtag_status`, `hashtag_type`, `linked_entity_type`, `opportunity_status`, `opportunity_visibility`, `reserved_category`, `rsvp_status`, `space_update_type`, `task_status`, `verification_status`).
- This is the result of 18 months of additive schema growth with very little pruning. Many tables exist but are now stub/zombie (see "duplicate / overlapping" callouts).

### Core tables (by domain)

#### Identity / Profiles

##### `profiles` — the canonical user table (≈140 columns, references `auth.users.id`)
- **Purpose:** Every signed-in user's full profile. This table has grown to be a kitchen sink.
- **Identity:** `id` (uuid, PK = auth.users.id), `username` (text, unique, required), `email`, `first_name`, `last_name`, `middle_initial`, `display_name`, `full_name`, `pronouns`, `avatar_url`, `avatar_position` (json), `banner_url`, `banner_gradient`, `banner_overlay`, `banner_type`, `headline`, `bio`, `profession`, `professional_role`, `professional_summary`, `professional_sectors[]`, `industry`, `industries[]`, `industry_sectors[]`, `company`, `years_experience`, `years_of_experience` (duplicate), `education`, `certifications`, `achievements`.
- **Geo:** `location`, `current_location`, `current_city`, `current_country`, `current_country_code`, `current_country_id` (FK → countries), `current_country_name`, `current_region`, `country_of_origin`, `country_of_origin_id`, `country_origin` (duplicate), `origin_country_code`, `origin_country_name`, `timezone`. (Multiple duplicate geo columns — clean-up debt.)
- **Diaspora identity:** `diaspora_origin`, `diaspora_status`, `diaspora_story`, `diaspora_networks[]`, `diaspora_tags` (jsonb), `ethnic_heritage[]`, `years_in_diaspora`, `years_in_diaspora_text`, `africa_focus_areas[]`, `africa_visit_frequency`, `african_causes[]`, `home_country_projects`, `return_intentions`, `my_dna_statement`, `agrees_to_values`.
- **Intentions / engagement:** `intentions[]`, `intents[]`, `intent_tags` (jsonb), `engagement_intentions[]`, `selected_pillars[]` (which of the Five C's the user cares about), `interests[]`, `interest_tags[]`, `focus_areas[]`, `impact_areas[]`, `impact_goals[]`, `impact_regions[]`, `impact_scores` (jsonb), `impact_scores_updated_at`, `regional_expertise[]`, `sectors[]`, `sector_tags` (jsonb), `sdg_focus[]`, `advocacy_interests[]`, `community_involvement`, `giving_back_initiatives`, `past_contributions`, `why_contribute`, `innovation_pathways`, `fundraising_status`, `venture_name`, `venture_stage`.
- **Skills & offers:** `skills[]`, `skill_tags` (jsonb), `skills_offered[]`, `skills_needed[]`, `language_tags` (jsonb), `languages[]`, `mentorship_offering` (bool), `mentorship_areas[]`, `mentorship_interest[]`, `seeking_mentorship` (bool), `availability_for_mentoring` (bool), `availability_hours_per_month`, `available_hours_per_month` (duplicate), `available_for[]`, `availability_tags` (jsonb), `availability_visible`, `looking_for_opportunities`, `open_to_opportunities`, `collaboration_needs[]`, `collaboration_tags` (jsonb), `contribution_style`, `contribution_tags` (jsonb), `contribution_types[]`, `what_to_give[]`, `what_to_receive[]`, `needs[]`, `offers[]`, `support_areas[]`, `networking_goals[]`, `event_interest_tags` (jsonb).
- **Onboarding & engagement state:** `onboarding_completed` (bool), `onboarding_completed_at`, `onboarding_stage`, `onboarding_progress` (jsonb), `onboarding_recommendations_viewed`, `user_type`, `first_action_completed`, `first_action_type`, `tour_completed_at`, `tour_current_step`, `tour_last_shown_at`, `tour_skipped_at`, `dashboard_version`, `last_active`, `last_active_at`, `last_seen_at`, `profile_completion_percentage`, `profile_completion_score`, `profile_completeness_score` (3 ways to express the same idea — debt).
- **Beta / verification:** `is_beta_tester`, `beta_phase`, `beta_status`, `beta_expires_at`, `beta_features_tested[]`, `beta_feedback_count`, `beta_signup_data` (jsonb), `verification_status` (enum: pending_verification | soft_verified | fully_verified), `verification_method`, `verified` (bool — separate from status), `verified_at`, `verification_updated_at`, `is_admin` (bool — direct flag, *also* mirrored in `user_roles`), `is_test_account`, `is_public`.
- **Counts:** `connection_count`, `follower_count`, `following_count`, `profile_views_count`.
- **Contact / social:** `phone`, `phone_number` (duplicate), `whatsapp_number`, `linkedin_url`, `twitter_handle`, `twitter_url`, `facebook_url`, `instagram_url`, `github_url`, `website_url`, `preferred_contact`, `preferred_contact_method` (duplicate), `email_visible`, `contact_number_visibility`.
- **DIA fields:** `dia_insight` (string of the user's surfaced DIA insight), `dia_insight_updated_at`, `adin_mode`, `adin_prompt_status`, `auto_connect_enabled`, `hidden_activity_ids` (jsonb), `pinned_activity_ids` (jsonb).
- **Privacy / consent:** `account_visibility`, `profile_visibility_settings` (jsonb), `visibility` (jsonb — yet another duplicate), `consent_event_invites`, `consent_marketing_emails`, `consent_partner_intros`, `consent_public_search`, `allow_profile_sharing`, `notifications_enabled`, `notification_preferences` (jsonb), `email_notifications`, `newsletter_emails`.
- **Username history:** `username_change_count`, `username_changes`, `username_changes_count`, `username_changes_left`, `username_history` (jsonb). (Yes, four columns about the same thing.)
- **Other:** `referral_code`, `referrer_id`, `intro_text`, `intro_audio_url`, `intro_video_url`, `recent_searches[]`, `roles[]` (string array — *also* duplicated in `user_roles` table), `user_role` (legacy single role string), `organization`, `organization_name`, `organization_category`, `created_at`, `updated_at`, `deleted_at` (soft delete).

##### `users` — a separate, smaller user table that appears to be vestigial
- Exists in the schema but unused in the active code path. Profile is the canonical entity.

##### `username_history`
- Audits username changes. Linked from `profiles.username_history` (jsonb mirror).

##### `user_roles` — proper role assignment table
- `user_id` (FK → profiles), `role` (`app_role` enum: `user` / `moderator` / `admin`), `granted_by` (FK → profiles), timestamps.
- The actual source of truth for admin/moderator checks via `has_role(_user_id, _role)` RPC. **BUT** `profiles.is_admin` and `profiles.roles[]` also exist and are referenced in places — this is a known footgun.

##### `verified_contributors`
- Vetted contributor flag — separate from `verification_status`.

##### `organizations` / `organization_verification_requests`
- Org profile entities. Verification request workflow exists but admin review UI not surfaced.

#### Geographic / reference data

- `continents`, `countries`, `regions`, `provinces` — reference data with FK columns into `profiles`, `events`, etc.
- `geographic_relevance` — many-to-many between content and geographies for DIA matching.
- `diaspora_data` — aggregated demographic stats.
- `economic_indicators`, `political_digest`, `innovation_data` — knowledge tables for `dia-search` / `curate-diaspora-events` to ground responses.

#### CONNECT (relationships)

- **`connections`** — bidirectional model: `a` (uuid, FK profiles), `b` (uuid, FK profiles), `status` (`requested` | `accepted` | `rejected`), `connection_note`, `adin_health` (int, default 50 — connection-strength score), `adin_health_reason`, `created_at`, `last_interaction_at`. RLS scoped to participants only. (Note: a *second* table `user_connections` also exists in the type file — likely a vestigial / parallel migration.)
- **`introductions`** — DIA-assisted introductions between two members.
- **`blocked_users`** — `blocker_id`, `blocked_id`.
- **`adin_recommendations`** — generated people-recommendations for a user (with dismiss tracking).
- **`adin_nudges`** — nudge queue records.
- **`adin_signals`** — raw signal log for the DIA learning loop.
- **`adin_preferences`** — per-user DIA preferences.
- **`adin_contributor_requests`** — DIA contributor flow.
- **`user_connections`**, **`user_follows`** — follow graph (separate from connection graph).
- **`user_interactions`** — generic interaction event log.
- **`user_recommendations`** — generic recommendation cache.
- **`profile_views`** — view-tracking ledger.

#### CONVENE (events)

- **`events`** — main event entity (organizer_id, title, description, start/end times, venue, format, type, visibility, status, cover_url, slug, capacity, etc.). Enums: `event_format` (in_person/virtual/hybrid), `event_type` (conference/workshop/meetup/webinar/networking/social/other).
- **`events_old`**, **`events_log`** — older versions kept around (debt).
- **`event_attendees`** — RSVP records (status: `rsvp_status` enum).
- **`event_registrations`** — fuller registration with custom answers.
- **`event_registration_questions`** — custom question definitions per event.
- **`event_check_ins`** / **`event_checkins`** (one used, one likely duplicate) — check-in records.
- **`event_ticket_types`**, **`event_tickets`**, **`event_ticket_holds`** — ticketing model with reservation locks.
- **`event_promo_codes`** — discount codes.
- **`event_waitlist`** — overflow queue.
- **`event_analytics`**, **`event_blasts`**, **`event_reminder_logs`** — operational tables.
- **`event_comments`**, **`event_roles`**, **`event_reports`** — engagement + moderation.
- **`community_events`**, **`community_event_attendees`** — possibly older/parallel community events flow.

#### COLLABORATE (spaces)

- **`spaces`** — primary spaces table (rebuilt during teardown — uses `name`, not `title`).
- **`collaboration_spaces`** — older spaces table still referenced. **This is the source of the trigger bug** documented in `.lovable/plan.md` (trigger referenced `NEW.title` on `spaces` table). Both tables coexist; type augmentation papers over it.
- **`space_members`**, **`collaboration_memberships`** — two parallel membership tables.
- **`space_roles`** — role bindings (separate from `group_member_role` enum).
- **`space_tasks`**, **`tasks`**, **`task_comments`**, **`space_task_dependencies`** — Kanban model.
- **`space_attachments`**, **`space_updates`**, **`space_activity_log`** — operational.
- **`space_templates`** — preset space configurations.
- **`projects`**, **`project_contributions`** — even older "project" abstraction (pre-rebuild artifact).
- **`initiatives`** — yet another collaborative-effort table.
- **`milestones`** — generic milestone records.

Phase-2 teardown stubbed out the *UI* for COLLABORATE (see `src/pages/dna/collaborate/CollaborateHub.tsx` returning `<RebuildingLanding module="collaborate"/>`), but **most schema is still live**. R1-B-1 cleanup (PR #125, commit `80dc2c9`) did FK remediation; full rebuild has not happened yet.

#### CONTRIBUTE (opportunities & needs/offers marketplace)

- **`opportunities`** — listings (jobs, grants, partnerships, fellowships).
- **`opportunity_applications`**, **`applications`** — application records (two tables exist; likely overlap).
- **`opportunity_bookmarks`**, **`opportunity_interests`** — saves.
- **`opportunity_contributions`** — contributions tied to specific opportunities.
- **`contribution_needs`** — "I need X" posts (enums: `contribution_need_type` funding/skills/time/access/resources, `contribution_need_priority`, `contribution_need_status`).
- **`contribution_offers`** — "I can offer Y" posts.
- **`contribution_cards`** — display unit for contributions.
- **`contribution_fulfillments`** — match between need and offer.
- **`contribution_acknowledgments`** — public attribution.
- **`impact_attributions`**, **`impact_log`**, **`impact_badges`** — impact-tracking ledger.
- **`platform_fees`** — fees taken on transactions.
- **`billing_transactions`** — Stripe-backed transaction log.
- **`causes`** — supported cause/charity entities.

Like Collaborate, the CONTRIBUTE *UI* is stubbed (`ContributeHub` returns the rebuilding placeholder) but the schema is largely intact.

#### CONVEY (content)

- **`posts`** — universal content table. The Convey "story" type also lives here (`post_type` distinguishes). Fields: `author_id`, `content`, `media_urls[]`, `visibility`, `original_post_id` (for reshares), `is_reshare`, counts, timestamps, plus a lot of derived columns and DIA scoring fields.
- **`post_comments`**, **`comments`** — yes, both tables exist; `comments` is older, `post_comments` is current.
- **`comment_reactions`**, **`comment_reports`** — engagement + moderation on comments.
- **`post_likes`**, **`post_reactions`** — likes (boolean) vs. reactions (typed: 🔥, ❤️, 👏, etc.).
- **`post_shares`**, **`post_views`**, **`post_analytics`**, **`post_bookmarks`** — engagement ledger.
- **`post_reports`**, **`hidden_posts`** — moderation + per-user hide.
- **`post_hashtags`**, **`hashtags`**, **`hashtag_followers`**, **`hashtag_analytics`**, **`hashtag_usage_requests`**, **`reserved_hashtags`** — full hashtag ownership system with personal vs. community tags and approval flow.
- **`feed_bookmarks`**, **`saved_posts`** — two ways to save (duplicate).
- **`feed_comments`**, **`feed_reactions`**, **`feed_reshares`**, **`feed_engagement_events`** — the *Feed* engagement ledger (separate from `post_*` tables — yet another duplication).
- **`feed_research_responses`** — survey responses tied to feed.
- **`muted_authors`** — per-user mute.
- **`mentions`** — `@username` references (inferred from post_mentions handling in code).

#### Messaging

- **`conversations`**, **`conversations_new`** — two parallel conversation tables (rebuild artifact).
- **`messages`**, **`messages_new`** — same again.
- **`conversation_participants`** — m:n membership.
- **`message_reactions`** — emoji reactions.
- **`group_conversations`**, **`group_members`**, **`group_messages`** — group chat.
- **`group_posts`**, **`group_post_likes`**, **`group_post_comments`** — group-internal feeds.
- **`group_join_requests`** — gated joins (`group_privacy` enum public/private/secret, `group_join_policy` open/approval_required/invite_only).
- **`groups`** — top-level group entity (separate from "communities" below).
- **`communities`**, **`community_memberships`**, **`community_posts`**, **`user_communities`** — *another* parallel community model.

This is one of the biggest duplications in the schema: **three** community-like models (`groups`, `communities`, `collaboration_spaces`/`spaces`).

#### Notifications

- **`notifications`** — primary notification rows.
- **`push_subscriptions`** — Web Push endpoints with VAPID.
- **`nudges`** — DIA-generated proactive prompts.
- **`newsletter_subscriptions`** — email lists.
- **`notification_preferences`** stored inline on `profiles.notification_preferences` (jsonb).

#### Hubs / Aggregates

- **`hub_metrics`** — denormalized counts per regional hub (live metrics displayed on `/africa/:region`).
- **`monthly_reports`** — pre-computed monthly stats.
- **`dashboard_analytics`** — admin dashboard aggregate cache.
- **`user_dashboard_preferences`** — per-user dashboard layout state.
- **`user_last_view_state`** — last route / view-state per user (for ADA navigation memory).

#### DIA (intelligence)

- **`dia_insights`** — generated insights surfaced as "Insight of the Day" / sidebar cards.
- **`dia_queries`**, **`dia_query_log`** — DIA chat history + raw log for analytics.
- **`dia_user_usage`** — per-user usage / quota counter.
- **`entity_vectors`**, **`user_vectors`** — pgvector embeddings for semantic matching (column types confirm vector usage).
- **`adin_*`** — many tables prefixed `adin_` predate the DIA rename and are still in use (recommendations, nudges, signals, preferences).

> Naming note: "ADIN" was the original name (African Diaspora Intelligence Network). It was renamed to **DIA** (Diaspora Intelligence Agent). Both names still appear throughout — the schema is heavy with `adin_*` tables, the front end mostly uses `dia*`. There are explicit redirects (`/dna/adin → /dna/dia`, `/admin/adin → /admin/dia`).

#### ADA (Adaptive Dashboard Architecture) experimentation

- **`ada_cohorts`**, **`ada_cohort_memberships`** — A/B cohort assignments.
- **`ada_experiments`**, **`ada_experiment_variants`**, **`ada_experiment_assignments`** — full experimentation framework schema.
- **`ada_policies`** — policy/eligibility rules.

UI for this is partial; the framework exists in `src/services/ada/` and `src/hooks/useAdaptiveConfig.ts`.

#### Trust / moderation

- **`content_flags`** — universal report ledger across content types.
- **`content_moderation`** — moderation queue/state.
- **`admin_activity_log`** — admin action audit.

#### Beta & waitlist

- **`beta_waitlist`** — waitlist signups from `/waitlist`.
- **`waitlist_signups`** — older / parallel waitlist table.
- **`invites`** — invite codes for invite-only signups (`InviteSignup.tsx`).
- **`alpha_feedback`**, **`user_feedback`**, **`feedback_messages`**, **`feedback_channels`**, **`feedback_channel_memberships`**, **`feedback_reactions`**, **`feedback_attachments`** — full in-app feedback system (Feedback Hub).

#### Misc / instrumentation

- **`analytics_events`**, **`engagement_metrics`** (via `user_engagement_tracking`), **`user_engagement_tracking`** — generic analytics ledger.
- **`error_logs`** — client-reported errors (`logHighError`).
- **`rate_limit_checks`** — server-side rate limit counters.
- **`cron_job_logs`** — cron run audit.
- **`feature_flags`** — DB-backed feature flags (separate from `src/config/featureFlags.ts`).
- **`release_features`**, **`releases`** — release notes data for `/releases`.
- **`sponsors`**, **`sponsor_placements`** — sponsorship system (with impression/click tracking RPCs).
- **`badge_definitions`**, **`user_badges`** — gamification skeleton.
- **`profile_completion`**, **`profile_skills`**, **`profile_causes`** — derived/auxiliary profile tables.
- **`skills`**, **`skill_analytics`**, **`skill_connections`** — skill taxonomy + endorsement.
- **`milestones`**, **`tasks`** — generic.
- **`search_preferences`** — saved search.
- **`user_adin_profile`** — DIA-specific user state.
- **`user_dna_points`** — points/XP system (largely unused in UI).
- **`user_onboarding_selections`** — onboarding answer log.

#### Views

- `adin_cost_tracking`, `adin_daily_stats`, `adin_popular_queries` — DIA usage views.
- `public_profiles` — RLS-friendly subset of `profiles`.
- `user_impact_summary` — aggregated impact view.

#### Constraints / indexes worth noting

I cannot inspect live indexes without DB access. From migrations the patterns are:
- All tables use UUID primary keys.
- `created_at`, `updated_at` triggers on most tables.
- Soft deletes (`deleted_at`) on a subset (notably `profiles`).
- `username` is uniquely constrained.
- Heavy use of `(select auth.uid())` rewrites for performance (see `lovable_patch.json`).
- `~4,113` RLS policy declarations in migrations — extensive but uneven coverage.

### Roles, tiers, membership levels

- **Auth role:** `app_role` enum = `user` | `moderator` | `admin`. Lives in `user_roles`. Checked via `has_role(_user_id, _role)` RPC.
- **Admin sub-roles** (declared in `AdminDashboardLayout.tsx`): `super_admin` | `platform_admin` | `content_admin` | `analytics_admin` | `support_admin` | `event_admin`. These are referenced in the UI but I did not confirm a backing column for them.
- **Beta status:** `profiles.beta_status` (free-text), `beta_phase`, `beta_features_tested[]`, `is_beta_tester` (bool), `beta_expires_at`. No formal "tier" enum.
- **Verification:** `verification_status` enum (`pending_verification` / `soft_verified` / `fully_verified`).
- **Subscription tiers:** DIA references `UserTier` / `SubscriptionTier` types in `src/types/dia.ts`, with `DIAFeatureTier`, but **there is no live paid tier**. Tier types exist as future-facing scaffolding only — there is no `subscription` table and no Stripe subscription product code path.
- **No formal "Member" vs. "visitor" distinction beyond "signed in / not signed in"** and onboarding completion. Authenticated + onboarded = Member.

---

## Section 3 — Authentication and Identity

- **Provider:** Supabase Auth, configured in `src/integrations/supabase/client.ts` with PKCE flow, persisted session, `storageKey: 'dna-auth-token'` in `localStorage`.

### Sign-up flow

1. Visitor lands on `/` (Index). Authenticated users are redirected to `/dna/feed`.
2. CTA paths: "Sign in" → `/auth`; "Join Waitlist" → `/waitlist`. Sign-up exists on `/auth` *but* the prominent CTA encourages waitlist (see Section 7 copy).
3. `/auth` (`src/pages/Auth.tsx`):
   - Email + password fields.
   - LinkedIn OIDC sign-in button (`provider: 'linkedin_oidc'`).
   - On submit: `supabase.auth.signUp({...})` with redirect to `/dna/feed`.
   - Custom error mapping (already-registered, password-strength, invalid email, network).
4. Supabase trigger creates a `profiles` row for the new `auth.users` row (logic in early migration).
5. After verification, user is sent to `/onboarding`.
6. **Onboarding** (`src/pages/Onboarding.tsx`) — 5 steps, fixed sequence:
   - Step 1: `UserTypeStep` — *How are you joining?* (`user_type`: individual, foundation/philanthropic org, etc.)
   - Step 2: `IdentityStep` — *Basic Identity* (first_name, last_name, avatar, current country, headline)
   - Step 3: `DiasporaOriginStep` — *Connection to Africa* (country_of_origin, diaspora_status)
   - Step 4: `DiscoveryStep` — *Your Interests & Goals* (interests, focus_areas, engagement_intentions)
   - Step 5: `UsernameStep` — *Claim Your Username* (with AI suggestions via `suggest-usernames` edge function)
   - Confetti on completion. Sets `onboarding_completed_at`.
7. `OnboardingGuard` (in `src/components/auth/OnboardingGuard.tsx`) wraps all authenticated `/dna/*` routes; if `onboarding_completed_at` is null AND `username` is null, the user is forced back to `/onboarding`.

### Login flow

1. `/auth` → email + password → `signInWithPassword`.
2. On success, fetches `first_name` / `full_name` for personalized greeting toast.
3. Redirect target is `location.state.from` (where the user was sent by `OnboardingGuard`) or `/dna/feed` by default.

### Profile creation flow

- The DB trigger inserts a minimal `profiles` row on auth signup.
- Real profile editing happens after onboarding via `/dna/profile/edit` (`ProfileEdit.tsx`) and `/dna/me` (which redirects to feed; the *profile view* is at `/dna/:username` → `ProfileV2`).
- Avatar/banner upload uses Supabase Storage; `useImageUpload` hook handles cropping via `react-easy-crop`.
- Public profiles are visible at `/dna/:username` to anyone; controlled by `profiles.is_public` + `profile_visibility_settings`.

### Role / permissions model

- `user_roles` is the source of truth via the `has_role` RPC.
- The `UnifiedHeader` queries `supabase.rpc('has_role', { _user_id, _role: 'admin' })` to show the admin link.
- `AdminRouteGuard` (in `src/components/admin/AdminRouteGuard.tsx`) protects `/admin/*`.
- The presence of `profiles.is_admin` and `profiles.roles[]` columns alongside `user_roles` is a known footgun (Section 10).

### Membership tier model

- **None active.** No paid tier. No member-only feature gates beyond `OnboardingGuard`. The Stripe code path is for **event tickets only**, not platform membership.

### Session management

- Supabase JWT in `localStorage` (`dna-auth-token`), auto-refresh enabled.
- `AuthContext` listens to `onAuthStateChange` and re-fetches profile.
- No SSO / SAML.

### Account recovery / password reset

- `/reset-password` page (`ResetPassword.tsx`) with `updateUser({ password })`.
- `send-password-reset` edge function sends the email via Resend.

### Threshold or "affirmation moment"

- **Not implemented as you mean it.** The closest analogs are:
  - Onboarding completion (`agrees_to_values` boolean exists on `profiles` but it's not currently surfaced as an explicit affirmation gate).
  - Beta gate logic (`useBetaStatus`) controls who gets beta features.
- No "I commit to / I affirm" moment in the current sign-up flow.

### Account deletion

- `delete-account` edge function exists. Soft delete via `profiles.deleted_at`. Not heavily surfaced in UI.

---

## Section 4 — Features Built (Surface by Surface)

The platform is organized into the **Five C's** (CONNECT, CONVENE, COLLABORATE, CONTRIBUTE, CONVEY) plus marketing, auth, DIA, admin, and settings. Below is the surface-by-surface inventory with concrete status.

### Marketing / public

| Surface | Route(s) | Status | Components / files | Description |
|---|---|---|---|---|
| Landing | `/` | Live | `src/pages/Index.tsx`, `HeroSection.tsx`, `PlatformFeatureShowcase.tsx`, `BuildingTogetherSection.tsx`, `WhoIsDNAForSection.tsx`, `Footer.tsx`, `RoadmapBanner.tsx` | Hero ("Welcome to the Diaspora Network of Africa"), DiasporaStats animated counters, Five C's framework section, who-DNA-is-for, footer. Redirects authed users to `/dna/feed`. |
| Manifesto | `/manifesto` | Live | `Manifesto.tsx` + `ManifestoSection.tsx` / `ManifestoLine.tsx` | Long-form, scroll-animated 10+ section manifesto. Some of the strongest writing in the product. |
| About | `/about` | Live | `About.tsx` | Mission ("create a unified platform that connects African diaspora professionals…"), Vision, Founder bio (Jaûne L. Odombrown). |
| Contact | `/contact` | Live | `Contact.tsx` | Contact form → `send-contact-email`. |
| Roadmap (annual event) | `/roadmap` | Live | `Roadmap.tsx` | DNA's flagship "ROADMAP 2026" event marketing page (Dec 2026, Los Angeles, The Beehive / SoLa Impact). Leaflet map, sponsor levels, RSVP form. |
| Partner With DNA | `/partner-with-dna`, `/partner-with-dna/sectors/:slug`, `/partner-with-dna/models`, `/partner-with-dna/start` | Live | `PartnerWithDna.tsx`, `PartnerSector.tsx`, `PartnerModels.tsx`, `PartnerStart.tsx` | Multi-page partner-pitch flow with sector subpages. |
| Five C's "Example" marketing pages | `/connect`, `/convene`, `/collaborate`, `/contribute`, `/convey` | Live (some archived) | `_archived/ConnectExample.tsx`, `Convene.tsx` (newer), `_archived/CollaborationsExample.tsx`, `_archived/ContributeExample.tsx`, `_archived/ConveyExample.tsx` | Public marketing pages per pillar. The Convene marketing page is the most up-to-date; the others are pulled from `_archived/`. |
| Convene marketing | `/convene`, `/convene/category/:category`, `/convene/featured-calendars`, `/convene/local-events` | Live | `Convene.tsx`, `ConveneCategoryPage.tsx`, `FeaturedCalendarsPage.tsx`, `LocalEventsPage.tsx` | Public events discovery, with category drilldowns. |
| Fact sheet | `/fact-sheet` | Live | `FactSheetPage.tsx` | Diaspora stats fact sheet. |
| Pitch deck | `/pitch-deck` | Live | `PitchDeck.tsx` | Investor pitch deck rendered in-browser. |
| Demo | `/demo` | Live | `Demo.tsx` | Product walkthrough / demo entry. |
| Design system showcase | `/design-system` | Live | `DesignSystem.tsx` | Internal component/token reference. |
| Install (PWA) | `/install` | Live | `Install.tsx` | PWA install prompt page. |
| Documentation | `/documentation/features`, `/documentation/features/:slug` | Live | `documentation/FeaturesHub.tsx`, `FeatureDetail.tsx` | Internal docs surfaced on the marketing site. |
| Releases | `/releases`, `/releases/:slug` | Live | `releases/ReleasesIndex.tsx`, `ReleaseDetail.tsx` | Release notes (backed by `releases` + `release_features` tables). |
| Archived features index | `/features/archived`, `/features/archived/:slug` | Live | `features/archived/ArchivedFeaturesIndex.tsx`, `ArchivedFeatureDetail.tsx` | "What we built, then pulled" — transparency surface. |
| Phase pages | `/phase-1/market-research` … `/phase-6/go-to-market` | Live | `MarketResearchPhase.tsx`, `PrototypingPhase.tsx`, `CustomerDiscoveryPhase.tsx`, `MvpPhase.tsx`, `BetaValidationPhase.tsx`, `GoToMarketPhase.tsx` | Process narrative across DNA's six build phases. |
| Africa regional hubs | `/africa/:regionSlug`, `/africa/:regionSlug/:countrySlug` | Live | `africa/RegionHubPage.tsx`, `africa/CountryHubPage.tsx` | Regional landing pages with live metrics from `hub_metrics`. |
| Legal | `/terms-of-service`, `/privacy-policy`, `/legal/user-agreement`, `/legal/privacy-policy`, `/legal/terms`, `/legal/cookie-policy` | Live | `TermsOfService.tsx`, `PrivacyPolicy.tsx`, `UserAgreement.tsx`, `CookiePolicy.tsx` | Standard legal. |
| Waitlist | `/waitlist` | Live | `Waitlist.tsx` | Captures full_name/email/location → `beta_waitlist`. |

### Auth & onboarding

| Surface | Route(s) | Status | Description |
|---|---|---|---|
| Login / signup | `/auth` | Live | Email/password + LinkedIn OIDC. |
| Password reset | `/reset-password` | Live | Update password after email link. |
| Invite signup | `/invite` | Live | Invite-code redemption (uses `invites` table). |
| Onboarding | `/onboarding` | Live | 5-step flow (see Section 3). |
| Welcome | `/dna/welcome` | Live | `dna/Welcome.tsx` — post-onboarding first-run experience. |

### CONNECT

| Surface | Route(s) | Status | Description |
|---|---|---|---|
| Connect hub | `/dna/connect` (redirects to `/dna/connect/discover`) | Live | `connect/Connect.tsx` + `ConnectLayout` (nested route layout). |
| Discover (people) | `/dna/connect/discover` | Live | `connect/Discover.tsx` — people discovery with filtering, DIA recommendations, search. |
| Network | `/dna/connect/network` | Live | `connect/Network.tsx` — your connections, pending requests, sent requests. |
| Public profile | `/dna/:username` | Live | `ProfileV2.tsx` — full profile (overview, posts, events, spaces, contributions tabs). |
| Profile edit | `/dna/profile/edit`, `/app/profile/edit` | Live | `ProfileEdit.tsx` — multi-section profile editor. |
| My profile redirect | `/dna/profile`, `/dna/me` | Live | Redirects to `/dna/:username` of authed user. |
| Identity Hub (in profile) | inside `ProfileV2` | Live | `useIdentityHub` aggregates heritage, skills, causes; powers right-rail summary. |
| Profile-completion guide | global | Live | `ProfileCompletionGuide.tsx` (modal/banner that prompts completion). |

### Messaging

| Surface | Route | Status | Description |
|---|---|---|---|
| DM inbox | `/dna/messages`, `/dna/messages/:conversationId` | Live | `dna/Messages.tsx` (two-column 35%/65% layout via `TwoColumnLayout`). 1:1 + group conversations. Real-time. Entity-sharing (share an event / space / opportunity into a thread). |
| Group thread | `/dna/messages/group/:groupId` | Live | `dna/GroupThread.tsx`. Group chat surface. |
| Components | — | Live | `MessageBubble` (iMessage-style), `MessageComposer`, `ConversationListPanel`, `ChatThread`, `PresenceIndicator`, `TypingIndicator`, `CreateGroupDrawer`, `MessageSearch`, `IntroductionMessageCard`. |
| Status | — | Mostly live | Real-time blockers were the focus of recent PRs #129/#130 — channels are now scoped per-user. Read receipts / delete-message still rough. |

### CONVENE (events)

| Surface | Route | Status | Description |
|---|---|---|---|
| Convene hub | `/dna/convene` | Live | `ConveneHub.tsx` → `ConveneDiscovery`. |
| Events index | `/dna/convene/events` | Live | `EventsIndex.tsx` — list, filter, calendar view (`react-big-calendar`), map view (`leaflet`). |
| Event detail | `/dna/convene/events/:id` | Live (public) | `EventDetail.tsx` — full event page with `StickyRSVPBar`, organizer card, mutual attendees, social proof, threading. |
| Event edit | `/dna/convene/events/:id/edit` | Live | `EditEventPage.tsx`. |
| Event create | (Universal Composer) | Live | Event creation now flows through the Universal Composer with mode "event". `src/services/composerService.ts` has the consolidated create RPCs (PR #128). |
| Event check-in | `/dna/convene/events/:id/check-in` | Live | `EventCheckIn.tsx` with QR scan (`@zxing/browser`). |
| Event analytics (organizer) | `/dna/convene/events/:id/analytics`, `/dna/convene/analytics` | Live | `EventAnalytics.tsx`, `OrganizerAnalytics.tsx`. |
| Event management console | `/dna/convene/events/:eventId/manage/*` | Live | Nested layout with sub-routes: overview, attendees, check-in, communications, analytics, team, settings. (`EventManagementLayout.tsx` + 7 sub-pages.) |
| My events | `/dna/convene/my-events` | Live | RSVPs + organized events. |
| Groups inside Convene | `/dna/convene/groups`, `/dna/convene/groups/:slug`, `/dna/convene/groups/:slug/events`, `/dna/convene/groups/:slug/settings` | Live | Groups browse + detail + per-group events. |
| Public event share | `/event/:slugOrId` | Live | `PublicEventPage.tsx`. |
| Curated diaspora events | (DIA) | Live edge | `curate-diaspora-events` edge function pulls Perplexity-grounded event suggestions. |
| Tickets / payments | — | Partial | `create-payment`, `verify-payment`, `stripe-webhook` edge functions + `event_ticket_types`/`event_tickets`/`event_ticket_holds`/`event_promo_codes` tables. Likely live for paid events but not heavily exercised. |
| Calendar export | per-event | Live | `AddToCalendarButton.tsx` + `ics` library. |
| Reminders + blasts | — | Live edge | `send-event-reminders`, `send-event-blasts` edge functions (cron-scheduled). |

### COLLABORATE (spaces)

| Surface | Route | Status |
|---|---|---|
| Collaborate hub | `/dna/collaborate` | **Stubbed for rebuild** — returns `<RebuildingLanding module="collaborate"/>`. |
| Spaces index | `/dna/collaborate/spaces` | Live (legacy code path still active) | `SpacesIndex.tsx`. |
| Space detail | `/dna/collaborate/spaces/:slug` | Live | `collaborate/SpaceDetail.tsx`. |
| Space board (Kanban) | `/dna/collaborate/spaces/:slug/board` | Live | `SpaceBoard.tsx` using `@dnd-kit/*`. |
| Create space | `/dna/collaborate/spaces/new` | Live | `CreateSpace.tsx`. |
| Space settings | `/dna/collaborate/spaces/:slug/settings` | Live | `SpaceSettings.tsx`. |
| My spaces | `/dna/collaborate/my-spaces` | Live | `MySpaces.tsx`. |
| Legacy spaces | `/dna/spaces`, `/dna/spaces/:id`, `/dna/space/:slug` | Live (redirects + legacy components) | `CollaborationSpaces.tsx`, `SpaceDetail.tsx`. |
| Coming Soon page | (referenced) | Live | `ComingSoonCollaborate.tsx` — exists but the active stub is `RebuildingLanding`. |

Mixed state: the **hub landing is a "we're rebuilding" placeholder** while the **sub-routes (spaces index, detail, board, create) still function** with the legacy code. This is a partial teardown.

### CONTRIBUTE

| Surface | Route | Status |
|---|---|---|
| Contribute hub | `/dna/contribute` | **Stubbed for rebuild** — `<RebuildingLanding module="contribute"/>`. |
| Needs index | `/dna/contribute/needs` | Live | `NeedsIndex.tsx`. |
| Need / opportunity detail | `/dna/contribute/needs/:id`, `/dna/contribute/:id` | Live | `OpportunityDetail.tsx`. |
| My contributions | `/dna/contribute/my` | Live | `MyContributions.tsx`. |
| Fulfillment tracker | `/dna/contribute/fulfillment/:fulfillmentId` | Live | `FulfillmentTracker.tsx`. |
| Impact dashboard | `/dna/contribute/impact` | Live | `ImpactDashboard.tsx`. |
| Applications | `/dna/applications`, `/dna/applications/received` | Live | `MyApplications.tsx`, `ApplicationsReceived.tsx`. |
| Opportunities (legacy route) | (handled via `/dna/contribute/:id`) | Live | Same OpportunityDetail page. |
| Legacy impact | `/dna/impact`, `/dna/impact/:id` | Redirects to contribute | Aliased. |

Same pattern as Collaborate: hub stubbed, sub-routes still operational.

### CONVEY (content)

| Surface | Route | Status |
|---|---|---|
| Convey hub | `/dna/convey` | Live | `ConveyHub.tsx` → `ConveyStoryHub.tsx`. Stories feed. |
| Create story | `/dna/convey/new` | Live | `CreateStory.tsx` with `RichTextEditor`, `CoverImageEditor`, `StorySeriesSelect`, `StoryTagsInput`. |
| Story detail (canonical) | `/dna/story/:slug` | Live | `FeedStoryDetail.tsx`. Public — no auth required. |
| Story detail (legacy) | `/dna/convey/stories/:slug` | Live | `StoryDetail.tsx`. |
| Legacy post redirect | `/dna/convey/post/:id` | Redirects | Aliased to new story URL. |
| Reactions on stories | inline | Live | `ConveyReactionsBar.tsx`. |
| Categories & trending | on hub | Live | `ConveyCategorySection.tsx`, `ConveyTrendingSection.tsx`, `ConveyEditorialCards.tsx`. |

### Feed (the multi-C activity stream — distinct from Convey)

| Surface | Route | Status |
|---|---|---|
| Universal feed | `/dna/feed` | Live | `dna/Feed.tsx` — the authenticated home. Tabs: All / Network / My Posts / Bookmarks. Backed by `get_universal_feed` RPC (pagination fixed in PR `2bdcf13`). Components: `UniversalFeedInfinite`, `PersonalizedFeed`, `MobileFeedTabs`, `FeedLeftPanel`, `FeedCommunityPulse`, `FeedRightSidebar`, `FeedHappeningNow`, `FeedUpcomingEvents`, `FeedActiveSpaces`, `FeedProfileCard`, `FeedSponsorCard`, `LiveActivityTicker`, `PopularPostsSection`, `TrendingHashtags`, `SpotlightCard`. |
| Saved posts | `/dna/saved` | Live | `SavedPostsPage.tsx`. |
| Hashtag feed | `/dna/hashtag/:hashtag` | Live | `HashtagFeed.tsx` (hashtag ownership system). |
| Debug feed | `/dna/debug/feed` | Live (dev) | `DebugUniversalFeed.tsx`. |
| Public post share | `/post/:postId` | Live | `PublicPostPage.tsx`. |

The Feed is **the most fleshed-out surface in the product**. It hosts:
- Posts, stories, events, spaces, opportunities — all rendered as `FeedItem` cards.
- DIA cards interleaved (cross-C suggestions).
- Reactions (multi-emoji), comments, reshares, bookmarks, share menu, link previews, media lightbox, video embeds, mention autocomplete, hashtag chips.
- Right-rail data layer redesigned recently (PR #131).

### Universal Composer

- **Status:** Live, used as the global "+" Create button (in `UnifiedHeader` and `MobileBottomNav`).
- **File:** `src/components/composer/UniversalComposer.tsx` + `modeHandlers.ts`.
- **Modes:** post, story (Convey), event (Convene), space (Collaborate), need/offer (Contribute) — selected via `ComposerModeSelector`. DIA intent detection (`diaIntentDetectionService.ts`) suggests switching modes as the user types.
- **Backend:** consolidated create RPCs (PR #128, commit `45ff7e7`).
- **Mobile:** Vaul bottom sheet with custom drag handle (compat shim for v0.9.3).
- **Success screen** shows celebration + DIA-recommended next action.

### Groups

- **Routes:** `/dna/convene/groups`, `/dna/convene/groups/:slug`, plus `/dna/messages/group/:groupId`.
- **Pages/components:** `GroupsBrowse.tsx`, `GroupDetailsPage.tsx`, `GroupSettingsPage.tsx`, `GroupThread.tsx`, `CreateGroupDialog.tsx`, `GroupCard.tsx`, `GroupJoinRequests.tsx`, `GroupPostComments.tsx`.
- **DB:** `groups`, `group_members`, `group_messages`, `group_posts`, `group_join_requests`, plus `group_conversations`.
- **Status:** Live. **Has known critical RLS bugs** documented in `docs/SECURITY-AUDIT-GROUPS.md` (Section 10).

### Notifications

| Surface | Route / location | Status |
|---|---|---|
| Notifications page | `/dna/notifications` | Live | `dna/Notifications.tsx`. |
| Notifications page (alt) | `/notifications` | Live | `NotificationsPage.tsx`. |
| Notification settings | `/notifications/settings`, `/dna/settings/notifications` | Live | `NotificationSettingsPage.tsx`, `dna/settings/NotificationSettings.tsx`. |
| Bell + badge | global | Live | `UnifiedNotificationBell`, `BadgeToastListener`. |
| Push notifications | global | Live (Web Push only) | `usePushNotifications` hook, `send-push-notification` edge function, `push_subscriptions` table. Hardcoded VAPID key. |
| Email notifications | per-event | Live | Routed through `send-notification-email` / `send-universal-email`. |

### DIA (intelligence layer)

| Surface | Route | Status |
|---|---|---|
| DIA hub | `/dna/dia` (legacy `/dna/adin`) | Live | `dna/DiaPage.tsx`. |
| DIA preferences | `/dna/preferences` | Live | `DiaPreferences.tsx`. |
| DIA admin | `/admin/dia` (legacy `/admin/adin`) | Live | `admin/DiaAdminPage.tsx`. |
| Insight cards on Feed | inline | Live | `getDIACardsForFeed` injects DIA cards into Feed. |
| DIA Chat | inline / overlay | Partial | `diaChat.ts` service exists; chat UI not the primary surface. |
| DIA search | global | Live (edge) | `dia-search` edge function. |
| Room Reasoning | (Rooms surface — emerging) | Live (edge, recent) | `dia-room-reasoning` edge function (PR #132). Used for "Room" curation reasoning. |
| Insight of the Day | Feed | Live | `DiaInsightOfDay.tsx`. |
| DIA nudges | Feed / Notifications | Live | `nudges`, `adin_nudges` tables; `diaNudgeEngine.ts`, `diaPeriodicCheck.ts` (initialized in `BaseLayout`). |
| DIA cross-C cards | Feed | Live | `connectCards`, `conveneCards`, `collaborateCards` (stubbed for rebuild), `contributeCards` (stubbed for rebuild), `conveyCards`, `crossCCards`. |
| DIA matching engine | service layer | Live | `matchingEngine.ts`, `peopleMatching.ts`, `eventMatching.ts`. (`opportunityMatching` and `spaceMatching` **explicitly stubbed during Phase 2 teardown** per `src/services/dia/index.ts:33–34`.) |

### Search

- Global search via `global-search` edge function (Perplexity-grounded for "outside" knowledge + local profiles/events/posts/hashtags).
- `searchService.ts` is the client. `SearchDialog` triggered from `UnifiedHeader`.
- AI-intent search via `ai-search` edge (OpenAI `gpt-4o-mini`).

### Admin

| Surface | Route | Status |
|---|---|---|
| Admin login | `/admin-login` | Live | `AdminLogin.tsx`. |
| Admin shell | `/admin` (gated by `AdminRouteGuard`) | Live | `AdminDashboardLayout.tsx`. |
| Overview | `/admin`, `/admin/dashboard` | Live | `AdminDashboardOverview.tsx`. |
| Users | `/admin/users` | Live | `UserManagement.tsx`. |
| Moderation | `/admin/moderation` | Live | `ContentModeration.tsx`. |
| Engagement analytics | `/admin/analytics`, `/admin/analytics/engagement` | Live | `EngagementDashboard.tsx`. |
| Collaboration analytics | `/admin/analytics/collaboration` | Live | `CollaborationAnalytics.tsx`. |
| Contribution analytics | `/admin/analytics/contributions` | Live | `ContributionAnalytics.tsx`. |
| Spaces admin | `/admin/spaces`, `/admin/spaces/moderation` | Live | `SpaceManagement.tsx`, `SpaceModeration.tsx`. |
| Contributions admin | `/admin/contributions`, `/admin/contributions/moderation` | Live | `ContributionManagement.tsx`, `ContributionModeration.tsx`. |
| DIA admin | `/admin/dia` | Live | `DiaAdminPage.tsx`. |
| Errors | `/admin/errors` | Live | `ErrorDashboard.tsx`. |
| Legacy admin | `/app/admin/*` | Live (parallel) | `AdminLayout.tsx` + sub-routes (waitlist, users, health, engagement, signals, moderation, convey analytics). Has older nav. |
| User Admin Hub | `/dna/admin` | Live | `UserAdminHub.tsx` — *personal* admin (not platform admin) for managing your own activity across the Five C's. |

### Settings

| Surface | Route | Status |
|---|---|---|
| Settings index | `/dna/settings` → redirects to `/dna/settings/account` | Live |
| Account | `/dna/settings/account` | Live | `AccountSettings.tsx`. |
| Privacy | `/dna/settings/privacy` | Live | `PrivacySettings.tsx`. |
| Blocked users | `/dna/settings/blocked` | Live | `BlockedUsersSettings.tsx`. |
| My reports | `/dna/settings/reports` | Live | `MyReportsSettings.tsx`. |
| Notifications | `/dna/settings/notifications` | Live | `NotificationSettings.tsx`. |
| Preferences | `/dna/settings/preferences` | Live | `PreferencesSettings.tsx`. |
| Hashtags | `/dna/settings/hashtags` | Live | `MyHashtagsSettings.tsx`. |

### Feedback Hub

- Route: `/dna/feedback` → `FeedbackPage.tsx`.
- Global FAB (`FeedbackFAB`) on all `/dna/*` routes opens `FeedbackDrawer`.
- Tables: `feedback_channels`, `feedback_channel_memberships`, `feedback_messages`, `feedback_reactions`, `feedback_attachments`.
- Allows in-app feedback threads. Alpha-test infrastructure exists (`AlphaTestGuide`, `AlphaWelcomeBanner`) gated by `FEATURE_FLAGS.isAlphaTest` (currently `false`).

### NudgeCenter

- Route: `/dna/nudges` → `NudgeCenter.tsx`.
- Surfaces DIA-generated nudges (`nudges` table).

### Analytics

- Route: `/dna/analytics` → `dna/Analytics.tsx`.
- User-facing analytics on their own posts/profile/engagement.

### Sponsorship

- Backend: `sponsors`, `sponsor_placements` tables + RPC `track_sponsor_impression`, `track_sponsor_click`.
- UI: `FeedSponsorCard` in the Feed right rail and inline.

### Identity Hub (within profile)

- `profileIdentityHubService.ts` aggregates heritage / skills / endorsements / mutuals / DIA rematch triggers.
- Driven by RPCs: `endorse_skill`, `trigger_dia_rematch`, `record_profile_view_hub`, `get_mutual_connection_count`, `count_connection_countries`.

### Pulse (status / live activity)

- `PulseBar`, `PulseDock` components in BaseLayout.
- Real-time presence + live activity indicators.

### "Not implemented" gaps worth naming explicitly

- **Marketplace / paid services exchange:** beyond event ticketing, no marketplace flow lives in code today.
- **Crowdfunding:** no Stripe Connect, no campaign / pledge entities.
- **In-product video calls / live streaming:** not implemented.
- **Native mobile apps:** not implemented.
- **Offline mode:** not implemented.
- **Multilingual UI:** copy is English-only. No i18n framework in the dependency tree.
- **DAO / governance / voting:** not implemented.
- **Affirmation moment / threshold ceremony for new members:** not implemented.

---

## Section 5 — User Flows

These flows are derived from the code, not from observed user testing.

### Flow 1: Visitor → Sign-up → First experience

1. Visitor lands on `/` (homepage). Sees hero, Five C's framework, DiasporaStats. May see `RoadmapBanner` if not yet dismissed.
2. Visitor either clicks **Sign in** (existing user → `/auth`) or **Join Waitlist** (→ `/waitlist`).
   - Waitlist form captures name, email, location → `beta_waitlist` row + `send-welcome-email`.
   - Or if invited, visitor clicks invite link → `/invite` → `InviteSignup.tsx` redeems `invites` code and proceeds to signup.
3. Visitor at `/auth` enters email + password (or clicks LinkedIn). Supabase Auth creates `auth.users` row.
4. DB trigger creates a near-empty `profiles` row.
5. Verified email lands the user back; on next sign-in the user is redirected to `/dna/feed` *but* `OnboardingGuard` detects `onboarding_completed_at` is null and `username` is null and pushes them to `/onboarding`.
6. Visitor goes through 5 onboarding steps:
   - User type → identity → diaspora origin → interests → username (with AI suggestions).
7. Confetti, `onboarding_completed_at` is set, redirect to `/dna/connect/discover` (per OnboardingGuard's "already onboarded" branch).
8. **However**, the actual post-onboarding home is `/dna/feed` (the default redirect after sign-in). Mid-flow there is also `/dna/welcome` which surfaces a first-time walkthrough (`FirstTimeWalkthrough`).
9. The new member sees Feed (universal feed with empty state for "All" if no follows yet, plus a DIA "Insight of the Day" card, and a `ProfileCompletionGuide` modal nudging them to fill out more of the profile).

### Flow 2: Member → Discovers another Member

1. From `/dna/feed` or `UnifiedHeader`, member clicks **Connect** in nav → `/dna/connect/discover`.
2. `Discover.tsx` shows DIA-recommended people (via `adin_recommendations` and `peopleMatchingService`) plus search and filters (heritage, country, skills, interests, regional expertise, mentorship offering).
3. Each member appears as a `MemberCard` / `ConnectionCard` with avatar, headline, location, mutual connections, match reasons ("Why recommended" tooltip).
4. Member clicks a card → navigates to `/dna/:username` (`ProfileV2`) → sees overview / posts / events / spaces / contributions tabs.
5. From the profile, member clicks **Connect** → opens `ConnectionRequestModal` with optional note → POSTs to `connections` with status `requested`.
6. Recipient receives in-app notification + optional email (`send-notification-email`).
7. Recipient can accept/reject from `/dna/connect/network` (Pending tab). Accept calls `accept_connection` RPC, which sets status to `accepted` and seeds `adin_health` at 50.

### Flow 3: Member → Joins or creates a group

There are *two* "group" surfaces:

**Groups (Convene)**

1. Member opens `/dna/convene/groups` → `GroupsBrowse.tsx`.
2. Sees public/private groups. Clicks one → `/dna/convene/groups/:slug` (`GroupDetailsPage`).
3. If group is public → instant **Join**. If approval-required → `group_join_requests` row created; owner reviews in `GroupJoinRequests.tsx`. If secret/invite-only → can't see it unless invited.
4. Member is added to `group_members` and `group_conversations` for messaging.
5. To create: opens `CreateGroupDialog` (from header or my-groups) → selects privacy + join policy → creates `groups` + auto-joins as owner.

**Spaces (Collaborate)**

1. Currently hub is stubbed. Sub-routes still work:
2. Member goes to `/dna/collaborate/spaces` → `SpacesIndex`.
3. Creates via `/dna/collaborate/spaces/new` → `CreateSpace.tsx`.
4. Joins existing space via Space Detail → membership row in `space_members` / `collaboration_memberships`.

### Flow 4: Member → Posts content

**Post via Universal Composer:**
1. Member clicks the **+** button in `UnifiedHeader` or `MobileBottomNav` → `UniversalComposer` opens (mobile: vaul drawer, desktop: dialog).
2. Default mode: `post`. Member can switch to story / event / space / need/offer via `ComposerModeSelector`. `DIAIntentBar` may suggest a switch based on intent detection.
3. Member types content. Mentions (`@`) and hashtags (`#`) autocomplete (`MentionAutocomplete`).
4. Member adds media (image/video) → uploaded to Supabase Storage via `mediaUploadService.ts`.
5. Submit → `composerService.ts` calls the consolidated create RPC for the mode (consolidated in PR #128).
6. Post appears in `posts` table (or `events`, `spaces`, `contribution_needs` depending on mode).
7. `ComposerSuccessScreen` shows confirmation + DIA-suggested next action.
8. Post appears in author's feed and in the Network tab of their connections.

**Story via Convey:**
1. Member navigates to `/dna/convey/new` → `CreateStory.tsx`.
2. Uses `RichTextEditor` for long-form content, `CoverImageEditor` for hero image, `StoryTagsInput`, `StorySeriesSelect`.
3. Submits as `post_type: 'story'`.
4. Appears in Convey Hub + Feed.

### Flow 5: Member → Attends an event

1. From Feed (Upcoming Events sidebar) or `/dna/convene/events` (`EventsIndex`), member discovers an event.
2. Clicks → `/dna/convene/events/:id` (`EventDetail`). Sees title, description, organizer card, date/time, location (map if in-person), mutual attendees, social proof, comments thread.
3. Clicks RSVP → `StickyRSVPBar`.
   - Free event: creates `event_registrations` row + `event_attendees` row with status `going`. Custom registration questions (if any) collected.
   - Paid event: `create-payment` edge invokes Stripe checkout. On success, `stripe-webhook` confirms; `verify-payment` finalizes; `event_tickets` row created.
4. `event_blasts` may send a confirmation email via `send-event-blasts`.
5. Reminders: `send-event-reminders` edge cron fires before event.
6. On day-of: member opens `/event/:slug` or scans organizer's QR code (`EventCheckIn`).
7. Check-in writes `event_check_ins` row.
8. Post-event: `event_analytics` tracks attendance; "PastEventDiaNudge" can prompt the user to share a recap.

### Flow 6: Member → Contributes or donates

- **Stubbed.** The Contribute hub is showing the rebuilding placeholder. The sub-routes (`needs`, `:id`, `my`, `fulfillment/:fulfillmentId`, `impact`) are still functional in code:
  1. Member opens `/dna/contribute/needs` → `NeedsIndex`.
  2. Browses contribution needs (filterable by type: funding/skills/time/access/resources).
  3. Opens a need → `OpportunityDetail`. Sees description, requester, what's needed, priority.
  4. Submits an offer (creates `contribution_offers` row, status `pending`).
  5. Requester accepts/declines from `/dna/contribute/my`.
  6. Accepted offer becomes a `contribution_fulfillments` row; `FulfillmentTracker` page tracks status (pending → accepted → fulfilled).
- **Cash donation flow:** No dedicated donation product. Payments are routed through event ticket purchase via Stripe.

### Flow 7: Member → Sends a message

1. From a profile, member clicks **Message** → opens `MessageOverlay` or navigates to `/dna/messages`.
2. If no existing conversation, calls `create_direct_messaging_conversation` RPC.
3. Or for group: `create_group_messaging_conversation` (also via composer's "Create group" entry).
4. Messages saved to `messages_new` (the newer table). Realtime via Supabase channel scoped to the conversation participants.
5. Optional entity share: member can attach an event/space/opportunity card to a message via `EntitySharePicker`.
6. Read receipts handled by `messageService.ts` with `update_messaging_metadata`.
7. Recipient gets push notification (if subscribed) via `send-push-notification` and badge update via `BadgeToastListener`.

### Flow 8: Member → Edits profile

1. From header dropdown or `/dna/profile/edit` → `ProfileEdit.tsx`.
2. Tabs/sections: identity, professional, diaspora story, intentions, skills, interests, sectors, mentorship, social links, intro media (audio/video), banner, avatar.
3. Avatar upload: `useImageUpload` → crop via `react-easy-crop` → upload to Supabase Storage → set `avatar_url`.
4. Save calls per-section RPCs: `update_profile_about`, `update_profile_skills`, `update_profile_contributions`, `update_profile_interests`, etc.
5. Side-effects: `trigger_dia_rematch` RPC is called when skills or heritage change, forcing DIA to re-evaluate matches.
6. Profile completion percentage is recalculated.

### Other implemented flows

- **Mute / Block / Report:** From a profile or post — opens `ReportDialog` (creates `content_flags`) or `block_user` (writes `blocked_users`). View own reports at `/dna/settings/reports`.
- **Hashtag follow / claim:** `/dna/hashtag/:hashtag` → toggle follow via `toggle_hashtag_follow` RPC. Claim a personal hashtag via the hashtag ownership system.
- **Save post:** Bookmark icon in feed → `feed_bookmarks` or `post_bookmarks` (yes, both exist). Viewable at `/dna/saved`.
- **Search:** Global search dialog (`SearchDialog`) calls `global-search` edge function.
- **DIA chat:** Talk to DIA in the right rail panel — calls `dia-search` edge function with Perplexity grounding.

---

## Section 6 — Design System and Brand

### Design system

- **Implemented in:** `src/index.css` (CSS custom properties), `tailwind.config.ts` (semantic tokens), `src/lib/typography.config.ts` (typography utilities).
- **Foundation:**
  - Background: warm cream `#F9F7F4` (HSL `34 33% 97%`).
  - Foreground (text): warm black `#3D3833`.
  - Primary: **DNA Emerald** `#4A8D77` (HSL `153 31% 42%`) — also the CONNECT module color.
  - Accent: **DNA Copper** `#B87333`.
- **Five C's module colors** (semantic tokens):
  - CONNECT — Emerald (`#4A8D77`)
  - CONVENE — Amber Gold (`#C4942A`)
  - COLLABORATE — Forest Green (`#2D5A3D`)
  - CONTRIBUTE — Copper (`#B87333`)
  - CONVEY — Deep Teal (`#2A7A8C`)
  - DIA — Gold (`#C4942A` — overlaps with Convene by design)
- **Neutrals:** Cream, Sand, Stone, gray400/500/600/800, Black — all warm-shifted.
- **Legacy colors retained for backwards compatibility:** forest, terra, ochre, sunset, purple, copper, gold, mint, crimson, earth, sand, ocean, slate — currently still referenced across older components. This is documented in code as backward-compat debt.
- **Patterns:** "Kente", "Mudcloth" patterns referenced via `PatternBackground` component on hero/stats sections.

### Typography

- **Lora** (serif/heritage): Display, H1, H2, profile names, DIA insights, onboarding, empty states, stat numbers — "emotional weight."
- **Inter** (sans/UI): H3+, body, buttons, inputs, nav, metadata — "functional clarity."
- **JetBrains Mono** (mono): code displays.
- All wrapped in the `TYPOGRAPHY` token map (`src/lib/typography.config.ts`) for class reuse.

### Component library

- **shadcn/ui** sitting on Radix UI primitives.
- 61 base UI components under `src/components/ui/`: accordion, alert-dialog, avatar, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, dialog, drawer, dropdown-menu, form, hover-card, etc.
- DNA-specific UI primitives: `AfricaSpinner`, `CountryCombobox`, `PatternBackground`, `SearchableCountrySelect`, `TagMultiSelect`, `enhanced-button`, `enhanced-card`, `comprehensive-location-input`, `confirm-dialog`.

### Module gradients

`BaseLayout.tsx` applies per-pillar background gradients based on the route — Feed gets DNA mint, Convene gets sunset+purple, Collaborate gets terra+mint, etc. This is a subtle visual cue throughout authenticated routes.

### Brand guidelines

- Logo: `src/assets/dna-logo.png` (and `dna-logo-icon.png`).
- Manifesto: the cultural anchor for brand voice. The `/manifesto` page is the canonical articulation.
- Design system PRD mentioned at `docs/DNA-MASTER-PRD.md` and `docs/DNA_VISUAL_AUDIT_EXECUTIVE_SUMMARY.md` (the latter is brutally honest about the design's current shortcomings — see Section 12).

### Responsive design

- **Mobile-responsive but not mobile-first.**
- Breakpoints: xs(375), sm(640), md(768), lg(1024), xl(1280), 2xl(1536).
- Mobile-specific components: `MobileBottomNav`, `MobileHeader`, `MobileFeedTabs`, `MobileProfileCompletionBanner`, `ConveneMobileHeader`.
- Mobile-first iOS quirks handled (input font-size 16px to prevent zoom, safe-area-inset padding, overscroll-behavior).
- PWA installable (`manifest.json`, service worker).

### Accessibility

- No formal WCAG audit on file.
- Reduced-motion preference is respected in animations (`@media (prefers-reduced-motion)` in `index.css`).
- Skip-nav links: **not implemented** (flagged in `DNA_VISUAL_AUDIT_EXECUTIVE_SUMMARY.md`).
- Color contrast issues flagged in audit (DNA Copper/Gold fail WCAG AA for text on light backgrounds).
- `aria-live` regions: partial.
- Keyboard navigation: Radix primitives provide good baseline. Custom components varied.

---

## Section 7 — Content Currently in the Product

### Marketing / landing copy (verbatim, key snippets)

**Hero (Index page):**
> Welcome to the **Diaspora Network of Africa**
> Where the African diaspora goes from scattered potential to coordinated power.
> *One platform. Five ways to move Africa forward.*

**PageSEO description (Home):**
> Join 200M+ diaspora members on DNA, the platform for African professionals to connect, collaborate, and contribute to Africa's economic transformation.

**DNA Framework headline (PlatformFeatureShowcase → HeroTriangleSection):**
> The DNA Framework
> A virtuous cycle where **individual success fuels collective power**. Connect with leaders. Convene for breakthroughs. Collaborate on ventures. Contribute your assets. Convey your wins. Each action strengthens your network while mobilizing billions toward Africa's transformation.
> *You grow. The movement grows. Africa grows. That's the DNA way.*

**Five C's one-liners (verbatim):**
- **Connect** — *Forge powerful bonds across the global African diaspora.*
- **Convene** — *Gather for meaningful events and cultural celebrations.*
- **Collaborate** — *(text in HeroTriangleSection, full quote not pulled but follows same shape)*
- **Contribute** — *(same)*
- **Convey** — *(same)*

**About page (Mission):**
> To create a unified platform that connects African diaspora professionals, entrepreneurs, and innovators worldwide, enabling them to collaborate on impactful projects that drive sustainable development across Africa.

**About page (Vision):**
> A thriving ecosystem where the African diaspora's collective knowledge, resources, and passion transform into tangible solutions that address Africa's most pressing challenges and unlock its vast potential.

**Founder line:** Jaûne L. Odombrown — Founder & CEO. LinkedIn: `linkedin.com/in/jaunelamarr/`.

**Manifesto (`/manifesto`) — opening lines:**
> They scattered us across oceans.
> Stripped our names. Silenced our tongues.
> Drew borders through our bloodlines and called it history.
> But they forgot one thing:
> **You cannot erase what is written in the body.**

The manifesto runs ~10 sections, with these themes: the diaspora is 200 million strong, sends $100 billion/year back to Africa, has always been the largest investor in Africa's future — and is now finally seeing itself through DNA.

**Roadmap event marketing (`/roadmap`):**
> ROADMAP = Return Of the African Diaspora to Mobilize in support of Africa's Progress.
> Inaugural edition: December 2026, Los Angeles, The Beehive (SoLa Impact OZ campus).

**Module rebuild placeholders (`RebuildingPlaceholder.tsx`):**

> **Collaborate:**
> "COLLABORATE is being reimagined. We're rebuilding the way the diaspora builds together. Spaces — where capital, expertise, networks, and resources circulate — are entering a new chapter. What's coming will honor the same Five C's principle: every collaboration you create here circulates value across CONNECT, CONVENE, CONTRIBUTE, and CONVEY. The connections you've already made remain intact. Stay close. The next version of COLLABORATE arrives soon."
>
> **Contribute:**
> "CONTRIBUTE is being reimagined. Opportunities — the marketplace where the diaspora exchanges value with Africa — are entering a new chapter. What's coming will honor the same Five C's principle: every opportunity you post or apply to here circulates across CONNECT, CONVENE, COLLABORATE, and CONVEY. Your profile remains your application artifact. Stay close. The next version of CONTRIBUTE arrives soon."

### Onboarding copy (the 5 step titles, verbatim)

1. "How are you joining?"
2. "Basic Identity"
3. "Connection to Africa"
4. "Your Interests & Goals"
5. "Claim Your Username"

### Static pages live

- About (`/about`) — mission, vision, founder bio.
- Contact (`/contact`) — form.
- Manifesto (`/manifesto`) — long-form brand piece.
- Fact Sheet (`/fact-sheet`) — diaspora data points.
- Pitch Deck (`/pitch-deck`) — investor deck rendered in-app.
- Resources (`/Resources`, presumably routed elsewhere — `src/pages/Resources.tsx` exists but not registered in `App.tsx`).
- Partner With DNA (`/partner-with-dna` + 3 sub-pages).
- Six Phase pages (`/phase-1` … `/phase-6`).
- Africa regional hubs (`/africa/:region`, `/africa/:region/:country`).
- Releases (`/releases`, `/releases/:slug`).
- Archived features (`/features/archived`).
- Documentation/Features hub (`/documentation/features`).
- Roadmap event (`/roadmap`).
- All standard legal (Terms, Privacy, Cookie Policy, User Agreement).
- Install / PWA prompt (`/install`).
- Design System (`/design-system`).
- Demo (`/demo`).

### Diaspora Daily equivalent

- **Closest analog:** the **Convey Hub** (`/dna/convey`) is the editorial / stories surface. `ConveyEditorialCards.tsx` + `ConveyCategorySection.tsx` + `ConveyTrendingSection.tsx` provide editorialized story display.
- "Insight of the Day" via `DiaInsightOfDay.tsx` is a DIA-curated daily insight.
- There is *no* daily-newsletter equivalent yet. `send-newsletter` edge function exists but the daily editorial flow is not stood up.

### User-generated content

- I cannot enumerate UGC from inside the repo without DB access. The schema supports posts, stories, events, spaces, needs, offers, comments, reactions, hashtags, profiles. There is also a robust seed-data system (`SEED_DATA.sql` is 39KB, `src/services/seedDataService.ts` + `seed-test-accounts` edge function) which can populate the platform with synthetic data; `is_test_account` flag on profiles isolates seed users.

---

## Section 8 — Operational State

I want to be transparent here: I cannot query the live database from inside this audit. The numbers below are what I can infer or what is *not* in the codebase.

- **Users signed up:** Not visible from code. The schema supports it (`profiles` table exists with 140 columns), but I have no way to count rows.
- **Active users (30-day):** Not visible. `profiles.last_seen_at` is updated by trigger; admin dashboards (`EngagementDashboard.tsx`, `AdminDashboardOverview.tsx`) query this — but I can't see the values.
- **Beta program:** Exists. `beta_waitlist` table for signups; `is_beta_tester` / `beta_status` / `beta_phase` columns on `profiles`; `handle-beta-approval` edge function processes approvals. Admin has a "Waitlist" view (`WaitlistManagement.tsx` in legacy admin). Beta features can be flagged via `beta_features_tested[]`.
- **Invite system:** Implemented — `invites` table + `/invite` page + `InviteSignup.tsx`.
- **Partnerships integrated into product:** None integrated as product-level integrations. There is *marketing* for partners (`/partner-with-dna` + sectors) and a "Sponsors" data model (`sponsors`, `sponsor_placements` with impression/click tracking RPCs) — but this is internal sponsorship/placement, not third-party partner integrations.
- **Pricing / paid tiers active:** **None.** No subscription product exists in code. Stripe integration is limited to event ticket purchase.
- **Revenue:** Only via paid event tickets (if any have sold). No revenue table beyond `billing_transactions`. I cannot tell whether any tickets have actually transacted.
- **User feedback collected:** Yes, via the Feedback Hub (`/dna/feedback`) and the global `FeedbackFAB`. Feedback is stored in `feedback_messages` / `feedback_attachments` / `feedback_reactions` / `alpha_feedback` / `user_feedback`. I can't read the content from here. There's also `feed_research_responses` for in-feed surveys.
- **Usage analytics / telemetry:**
  - **In-house only.** No PostHog, Mixpanel, Amplitude, Segment, or third-party analytics SDK.
  - Custom: `feed_engagement_events` (tracked via `src/lib/feedAnalytics.ts`), `event_analytics`, `post_analytics`, `profile_views`, `hashtag_analytics`, `skill_analytics`, `analytics_events` (generic), `user_engagement_tracking`, `dashboard_analytics`, `user_interactions`, `dia_query_log`.
  - All `trackEvent`/`trackFeedEvent` calls fire to Supabase — non-blocking, silent-fail.
  - Errors: `error_logs` table; `logHighError` from `src/lib/errorLogger.ts`.
- **Cron jobs:** Edge functions run on schedule (Supabase pg_cron):
  - `auto-archive-releases`
  - `adin-nightly-health`
  - `connection-health-analyzer`
  - `engagement-reminders`
  - `send-event-reminders`
  - `generate-daily-briefs`
  - `process-automated-nudges`
  - `generate-connect-nudges`, `generate-opportunity-nudges`
  - `curate-diaspora-events`
  - Audit ledger in `cron_job_logs`.

---

## Section 9 — AI Integration State

### Where AI is currently integrated

DIA (Diaspora Intelligence Agent) is the unified intelligence brand. It surfaces in:

1. **Feed:** DIA cards interleaved with regular feed items, generated by per-pillar card generators (`connectCards`, `conveneCards`, `conveyCards`, `crossCCards`; `collaborateCards`/`contributeCards` currently stubbed).
2. **Insight of the Day:** `DiaInsightOfDay.tsx` on `/dna/feed`.
3. **DIA chat / search:** `dia-search` edge function powering query answers grounded against the user's network + Perplexity.
4. **Nudges:** Generated by `diaNudgeEngine.ts` / `nudgeEngineV2.ts` and stored in `nudges` / `adin_nudges`. Surfaced in `/dna/nudges` (NudgeCenter), in Feed (`NudgeCard`, `PostConnectionNudgeCard`), and as push/email via `process-automated-nudges`.
5. **People matching:** `peopleMatching.ts` produces ranked connection candidates with weighted signals (mutual connection strength, network overlap, degree of separation, skill complementarity, interest overlap, etc.). Surfaced in `/dna/connect/discover`.
6. **Event matching:** `eventMatching.ts` + `get-event-recommendations` edge function.
7. **Opportunity & space matching:** **Stubbed** in `src/services/dia/index.ts` (`opportunityMatching` and `spaceMatching` explicitly removed during Phase 2 teardown — to restore in Phase 3 rebuild).
8. **Onboarding:** Username suggestions via `suggest-usernames` edge function (Gemini via Lovable gateway).
9. **Composer:** `diaIntentDetectionService.ts` watches what the user types and suggests switching composer modes ("This sounds like an event — switch?"). `diaComposerService.ts` + `diaPostCreationService.ts` provide draft assistance.
10. **Voice transcription:** `transcribe-voice` edge function (OpenAI Whisper) — used for intro audio + voice messages.
11. **Diaspora event curation:** `curate-diaspora-events` edge function pulls live event news from Perplexity grounded against the `community_events` schema.
12. **Health analyzer:** `connection-health-analyzer` edge function updates `connections.adin_health` based on interaction signals.
13. **Periodic checks:** `diaPeriodicCheck.ts` (init'd in `BaseLayout` for every signed-in user) runs lightweight client-side intelligence at intervals.
14. **Right-rail data layer (recent):** `dna_right_rail_data_layer` migration (PR #131) hydrates the redesigned homepage right rail with DIA-curated suggestions.
15. **Room reasoning (newest):** `dia-room-reasoning` edge function (PR #132, May 14 2026) — supports DIA reasoning for an emerging "Room" curation surface.

### Models in use

| Model | Vendor | Where | Purpose |
|---|---|---|---|
| `gpt-4o-mini` | OpenAI | `ai-search/index.ts` | Search-intent analysis |
| `whisper-1` (via `/audio/transcriptions`) | OpenAI | `transcribe-voice/index.ts` | Voice → text |
| `sonar` | Perplexity | `dia-search`, `dia-room-reasoning`, `curate-diaspora-events`, `global-search` | Grounded retrieval-augmented responses |
| `llama-3.1-sonar-small-128k-online` | Perplexity (legacy) | Some functions | Same |
| `google/gemini-2.5-flash` | Google Gemini (proxied via Lovable AI Gateway) | `suggest-usernames`, `get-event-recommendations` | Lightweight generation |

**No Anthropic / Claude integration in product.** No fine-tuned models. No embeddings pipeline that calls a model — but the database does have `entity_vectors` / `user_vectors` columns (pgvector) and an `embeddingService.ts`. I did not verify which embedding model populates them; based on context it's most likely OpenAI ada or text-embedding-3 via a path I didn't fully trace.

### Data flow (what leaves DNA, what comes back)

For each DIA call:

- **`dia-search` (Perplexity):** Receives `{ query, source }` from authed user. Server combines the query with internal context (user's profile, network), then sends a synthesized prompt to `https://api.perplexity.ai/chat/completions` with `model: sonar`. **Outbound payload includes:** prompt text, system messages framing the answer ("answer as DIA…"), and citation expectations. Network matches are queried internally first and influence prompt construction. Response logged to `dia_query_log` and `dia_user_usage` is incremented. Citations are stored if Perplexity returns them.
- **`ai-search` (OpenAI):** Receives `{ query, userId }`. Sends *only the query* to OpenAI for intent classification (no PII leaves). Uses the structured intent to query the local DB for matching profiles/posts/events. No raw profile data is sent to OpenAI.
- **`transcribe-voice`:** Audio blob uploaded → sent directly to OpenAI Whisper. Returns text. Audio is *not* persisted at OpenAI per OpenAI's standard policy; we don't enforce zero-retention.
- **`suggest-usernames`:** Sends a candidate name + simple constraints to Lovable AI Gateway (Gemini). Receives suggestions.
- **`curate-diaspora-events`:** Sends search criteria (region, date range, sector) to Perplexity. Receives event candidates. Stored to `community_events` if curator approves.
- **`dia-room-reasoning`:** Receives Room context (room metadata, member list, recent activity). Sends synthesized prompt to Perplexity. Receives a "reasoning" output for why a Room should be curated/highlighted.

### Logging

- DIA query history in `dia_query_log` + `dia_queries` + `dia_user_usage` + `adin_cost_tracking` (view).
- `adin_signals` collects raw user behavior signals for the matching loop.
- Edge function logs go to Supabase function logs.

### Vendor contracts and data residency

- **No evidence in the codebase of formalized AI vendor contracts (BAAs, DPAs, or data-residency restrictions).** API keys live in Supabase function secrets (`OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `LOVABLE_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`).
- Supabase project region is not set in `config.toml` (would be at the Supabase dashboard level — not visible from here).
- No data-residency claims in the privacy policy referenced in code (the pages exist but I did not read them in full).

### AI-curated, AI-generated, or AI-suggested content

- **AI-curated:** Diaspora events imported via `curate-diaspora-events`; DIA cards on the Feed; DIA's "Insight of the Day"; trending hashtags ranking.
- **AI-generated:** Username suggestions (Gemini); transcripts (Whisper); Room reasoning text (Perplexity).
- **AI-suggested:** People-to-connect; events-to-attend; composer-mode-switch prompts; nudges ("you haven't talked to X in 90 days").

### Known issues / concerns

- **DIA brand inconsistency:** Mix of `adin_*` tables, `dia_*` services, `ADIN` references in older docs, and explicit redirects from `/dna/adin` → `/dna/dia`. The legacy name lingers in the data layer.
- **Stubbed services:** `opportunityMatching` and `spaceMatching` are commented-out in `src/services/dia/index.ts:33–34`. Until they're restored, DIA cannot recommend opportunities or spaces.
- **No formal eval harness:** No prompt regression tests. No golden-set evaluation. Updates to DIA prompts are released by commit, not by eval.
- **Cost tracking is internal-only:** `adin_cost_tracking` view exists but there's no budget enforcement at the application layer beyond `dia_user_usage` counters.
- **Hallucination risk on Perplexity-grounded responses:** The product surfaces DIA answers as confident statements (insights, recommendations). There's no UI for source citation in the consumer-facing surfaces (citations are captured but not always displayed).
- **No retry/circuit-breaker pattern** for external AI calls — a Perplexity outage results in silently degraded DIA surfaces.
- **No vendor diversity for critical paths:** Search/insight relies entirely on Perplexity. If Perplexity changes terms, prices, or quality, DIA degrades.

---

## Section 10 — Technical Debt and Known Issues

This is where I'm most direct.

### Architectural decisions that feel wrong in hindsight

1. **`profiles` is a 140-column kitchen-sink table.** Has 3–4 ways to express the same value (`country_of_origin` / `country_of_origin_id` / `country_origin` / `origin_country_code` / `origin_country_name`; `connection_count` / `follower_count`; `profile_completeness_score` / `profile_completion_percentage` / `profile_completion_score`; `roles[]` vs. `user_role` vs. `is_admin` vs. the separate `user_roles` table). Inserts and reads against this table are expensive; selects often use `SELECT *` (see `AuthContext.tsx`).
2. **Three parallel "community" abstractions:** `groups`, `communities`, `collaboration_spaces`/`spaces`. Each with its own membership table, message table, post table. None canonical.
3. **Two parallel post systems:** `posts` + `post_*` (comments/likes/reactions/views/shares/bookmarks) AND `feed_*` (`feed_comments`, `feed_reactions`, `feed_reshares`, `feed_engagement_events`, `feed_bookmarks`). They overlap and the Feed reads from both.
4. **Two parallel messaging tables:** `messages` + `messages_new`, `conversations` + `conversations_new`. Migration to `_new` is half-done.
5. **Two parallel auth role models:** `profiles.is_admin` (boolean), `profiles.roles[]` (text array), `profiles.user_role` (single text) **and** the proper `user_roles` table with `app_role` enum. Code checks all four in different places.
6. **All routes in one 820-line `App.tsx`:** No code-splitting boundary by feature, only by lazy import. Hard to read. (Audit at `docs/DNA-CODEBASE-AUDIT-HANDOFF.md` flags 13 files >700 lines.)
7. **"ADIN" → "DIA" rename never finished:** Tables/services/comments are mixed. Costs cognitive overhead for anyone new.
8. **The Universal Composer routes through consolidated RPCs only as of PR #128 (just merged).** Before that, each mode hit its own create path.
9. **Feed RPC was buggy:** `get_universal_feed` pagination broken until PR #123 (very recent). Implies the most-used surface in the product had broken pagination for an unknown stretch.
10. **The "rebuild" stubs are confusing in production.** A user can hit `/dna/collaborate` and see "We're rebuilding," but `/dna/collaborate/spaces` still works. This is an incomplete teardown, not a clean cutover.

### Features started but never finished

- **COLLABORATE rebuild** — stubbed (R1-B-1 cleanup done; rebuild not built).
- **CONTRIBUTE rebuild** — stubbed.
- **Group chat polish** — exists but read-receipts/delete-message rough per docs.
- **Polls** — schema exists; UI incomplete (per `docs/04-FEATURE-STATUS.md`).
- **Video/audio intros** — DB columns (`intro_audio_url`, `intro_video_url`) exist; UI minimal.
- **Badge gamification** — `badge_definitions` / `user_badges` schema; UI minimal.
- **`user_dna_points`** — XP system schema; no UI.
- **`alpha_feedback`** — collected, but no obvious admin view to triage.
- **DAO/voting** — not started; mentioned in some forward-looking PRDs.
- **Multilingual content** — not started.
- **`ADA` experimentation** — schema fully designed, UI for creating/managing experiments not surfaced.

### Performance concerns

- **N+1 risk on the Feed:** Hydration of feed items (author, mutuals, engagement counts, DIA cards) happens via mixed RPCs + per-item lookups. There has been no observed load testing.
- **Profile fetches use `SELECT *`** (`AuthContext.tsx` line 92) — pulling 140 columns on every auth state change.
- **Realtime subscription sprawl:** The recent PR #129/#130 fixes scope problems where subscriptions were over-subscribed across all users. There may be more remaining.
- **No pagination on some admin queries** (e.g., `UserManagement.tsx` patterns suggest full-table loads).
- **`react-query` STALE_TIMES were recently bumped** (profile 5 → 10 min; feed 1 → 2 min; static 30 → 60 min) — implies refetch storms were observed.

### Security gaps

- **`docs/SECURITY-AUDIT-GROUPS.md` flags critical RLS bugs** in the `groups` table: the policy `group_members.group_id = group_members.id` is a typo that breaks update-group RLS or matches wrong rows. The audit is dated 2025-11-03 and the file does not state it's been fixed. **Treat this as still open until verified.**
- **Multiple competing role checks** (`is_admin`, `user_roles`, `has_role` RPC) — an inconsistency anywhere becomes a privilege escalation risk.
- **VAPID public key is hardcoded in `usePushNotifications.ts:104`.** That's intentional for browser code but the private key handling on the edge function side should be verified.
- **Anon key in `src/lib/config.ts` is hardcoded** as the fallback. Acceptable for a Supabase anon key (it's safe to expose), but indicates the env-var hygiene isn't strict.
- **`Stripe webhook` has `verify_jwt = false` per `config.toml`** — correct, since Stripe doesn't send a Supabase JWT, but signature verification *is* implemented inside the function. Confirmed.
- **`seed-test-accounts` has `verify_jwt = false`** — this should be confirmed to be admin-gated inside the function. If anyone can hit it from the internet, it can pollute the DB.
- **No SAST / Snyk / Dependabot configured.** I see `npm audit` is the only check available.
- **727 migrations** — that many migrations means accumulated drift. Many of the early migrations were rewritten by `lovable_patch.json` to fix RLS perf (`auth.uid()` → `(select auth.uid())`). Some migrations may still hold old patterns.

### What breaks at scale

- **1k users:** Mostly fine. Feed queries will degrade with depth. Notification fanout (`send-universal-email`) on every event may hit Resend rate limits.
- **10k users:**
  - `get_universal_feed` will need server-side ranking + materialized views.
  - DIA cost (Perplexity per query) becomes meaningful. No budget enforcement.
  - Profile size (140 columns) starts to hurt cache density.
  - Realtime channel count balloons; subscription scoping must be airtight.
- **100k users:**
  - Schema overlaps (groups/communities/spaces; posts/feed_*) will cause data divergence and corrupt analytics.
  - `analytics_events` + `feed_engagement_events` write volume needs a dedicated event-log path (currently writes to the same primary DB).
  - DIA matching against the network (currently in-process JS code joining tables) needs to move to a serving layer with precomputed embeddings.
  - No multi-tenancy / sharding strategy in the schema.

### Duplicated or overlapping code/features

- Two `_archived/` directories of pages (`src/pages/_archived`, `src/components/_archived`).
- Two notification systems (`notifications` table + `notification_records` "provisional" table referenced in `notificationSystemService.ts`).
- Two waitlist tables (`beta_waitlist`, `waitlist_signups`).
- Two save-post tables (`feed_bookmarks`, `saved_posts`, `post_bookmarks` — actually three).
- Three event tables (`events`, `events_old`, `events_log` + `community_events`).
- Two opportunity tables / application tables (`opportunities` + `applications` AND `contribution_needs`/`contribution_offers`).
- Two engagement-ledger systems: `feed_engagement_events` AND `analytics_events` AND `user_engagement_tracking`.
- Two project-like abstractions: `projects`/`project_contributions` AND `initiatives` (both pre-Spaces and unused now).
- Two toast systems: Radix Toast + Sonner.
- Two calendar libraries: `react-big-calendar` + `react-day-picker` (different use cases, but still).
- Two date libraries: `date-fns` (primary) + `moment` (legacy holdover in deps).
- `EventCheckIn` lives in both `/pages/dna/convene/EventCheckIn.tsx` and `/components/convene/management/checkin/CheckInDashboard.tsx`.
- Two messaging implementations under `src/services/`: `messageService.ts` + `messagingPrdService.ts`.

### Quantitative debt indicators (from prior internal audit doc)

From `docs/DNA-CODEBASE-AUDIT-HANDOFF.md` (March 2026, internal):
- ~3,600 `any` type instances across 247 files.
- 400+ `console.log` statements.
- 40+ hardcoded URLs.
- 13 files over 700 lines.
- 75+ orphaned profile components.
- 35+ orphaned messaging components.

### Console/lint hygiene

- Only **13** `TODO`/`FIXME`/`HACK`/`@deprecated` markers in `src/`. (Surprisingly few — but likely because they're not being added rather than because debt is low.)
- ESLint runs but no enforcement; no test suite at all.

---

## Section 11 — Documentation State

### README

- `README.md` — generic Lovable scaffolding text. Mentions Vite/TS/React/shadcn/Tailwind. Does NOT describe the DNA product, architecture, or feature surface. **The actual README has not been written.** (I am not creating one in this audit — the user didn't ask me to.)

### Architecture docs

Heavy. The `/docs` directory has **80+ markdown files** plus 7 sub-directories (`audits`, `memories`, `qa`, `rebuild`, `tickets`, `verification`). Key:

- `docs/01-PLATFORM-ARCHITECTURE.md` — tech stack overview (slightly out of date — says router v6 but package.json declares v7).
- `docs/02-DATABASE-SCHEMA.md` — covers core tables.
- `docs/03-ROUTES-AND-PAGES.md` — route inventory.
- `docs/04-FEATURE-STATUS.md` — what's live vs. partial vs. planned.
- `docs/05-EDGE-FUNCTIONS.md` — edge functions catalog (only documents one in detail).
- `docs/DNA-MASTER-PRD.md` — the master PRD (Dec 2024) listing platform overview, feature status, build plan in phases.
- `docs/DNA-CODEBASE-AUDIT-HANDOFF.md` — a previous AI-to-AI handoff doc (March 2026). Comprehensive but already stale (e.g., says ~330 tables — matches; says 42 edge functions — now 43; says 200k LoC — plausible).
- `docs/DNA-ADMIN-PLATFORM-PRD.md` — admin requirements.
- `docs/DNA-SUPABASE-SCHEMA-EXPORT.md` — schema snapshot (may be outdated relative to 727 migrations).
- `docs/SECURITY-AUDIT-GROUPS.md` — critical RLS bug report (Nov 2025).
- Per-feature PRDs / audits: `docs/PRD-HASHTAG-PAGE-UI-ENHANCEMENTS.md`, `docs/PRD-discover-mobile-redesign.md`, `docs/PRD-Social-Feed-ADIN-Enhancement.md`, etc.
- Phase / sprint notes: `docs/PHASE2_ASSESSMENT.md`, `docs/PHASE_3_ACCEPTANCE_VERIFICATION.md`, `docs/WEEK_*_SUMMARY.md`, etc.

There are also **~50 audit/sprint/phase markdown files at the repo root** (e.g., `AUDIT_REPORT.md`, `DNA_FEED_AND_COMPOSER_AUDIT.md`, `DNA_PLATFORM_AUDIT.md`, `DNA_Platform_Audit_FINAL.md`, `PHASE_COMPLETION_REPORT.md`, `MESSAGING_TEST_REPORT.md`, `MOBILE_RESPONSIVENESS_FINAL_REPORT.md`, `ONBOARDING_REDESIGN_PLAN.md`, `SYSTEMS_AUDIT.md`, `TESTING_GUIDE.md`). These are documentation *artifacts* from prior AI/human collaboration sessions — they are not maintained or canonical.

### Onboarding docs for new collaborators

- Nothing structured. A new engineer would have to read `docs/01-` through `05-` and then triangulate. The `lovable_patch.json` + `.lovable/plan.md` files imply the project assumes Lovable-led development.

### API documentation

- **Not implemented.** No OpenAPI spec. No Storybook. RPC functions are documented only via TypeScript types in `src/integrations/supabase/types.ts`. Edge function `index.ts` files have inline comments but no consumer-facing spec.

### Testing guide

- `TESTING_GUIDE.md` and `docs/BETA_QA_CHECKLIST.md` exist as manual test scripts.
- No automated tests of any kind.

### Knowledge pack

- `docs/dna-knowledge-pack.json` and `docs/features-catalog.json` — JSON snapshots of platform knowledge (presumably consumed by DIA or AI dev tools).

### Documentation drift

The official `docs/` content was last updated Dec 2024 in many cases. The PRDs reflect the *intended* product at that point in time. The codebase has since gone through a Phase 2 teardown of COLLABORATE and CONTRIBUTE, the introduction of Universal Composer, the DIA rename, the Right-Rail redesign, and the Room reasoning function — *none* of which is reflected in the canonical docs.

---

## Section 12 — Your Honest Assessment

> Speaking as Claude Code, having walked the codebase for this audit.

### Strongest part of what we've built

**The data model and the connective-tissue concept are the platform's superpower.** The fact that there's a single `posts` table that backs the Feed, Convey stories, AND links to events/spaces/needs via `linked_entity_type` (an enum that already covers `event | space | need | story | community_post`) means the **DIA can already reason across all Five C's without needing schema changes**. The "every action circulates across the Five C's" promise in the marketing copy is *substantively* true at the data layer.

Concretely: when you create an event, it can be referenced in a post; when you offer to fulfill a need, it can be shared into a message thread; when you join a space, your activity surfaces in DIA cards on your connections' feeds. The graph is real, not aspirational.

**The Manifesto and the brand voice** are the strongest cultural assets. Most platforms would not write a 10-section scroll-animated manifesto invoking the Middle Passage. DNA did. That voice is a moat — and the visual gradients-per-pillar, custom `AfricaSpinner`, Lora-for-emotion / Inter-for-utility typography, and the Five-C color system are coherent enough to recognize.

### Weakest part

**The product surface has out-grown the product team's ability to maintain it.** 1,410 TypeScript files, 727 migrations, 43 edge functions, 76 component feature folders, and 330+ tables — but no test suite, no CI, three parallel community models, two parallel messaging tables, four parallel role checks, two parallel community-engagement ledgers, and a partially-stubbed Phase 2 teardown of two of the Five C's. The platform looks beautifully built from the outside; from the inside it's accumulated 18 months of "add, don't subtract" decisions.

The most concrete symptom: the *home* feed surface (`/dna/feed`, the route most users see on every visit) had broken pagination until a fix landed days ago in PR #123. That happened because no one was running the feed at scale in CI — there is no CI.

### Gaps relative to an ambitious diaspora network platform

1. **No "members of consequence" verification beyond a free-text status.** A serious diaspora platform needs trust signals: real-world identity verification, organizational verification (the schema is there, the workflow isn't surfaced), and an *affirmation moment* where joining means something. Right now joining is indistinguishable from signing up for a generic SaaS.
2. **No capital flow primitives.** Crowdfunding, group treasuries, escrow on offers, transparent contribution ledgers — none of it. The diaspora moves $100B/year per the manifesto; DNA doesn't yet have product surfaces that touch that flow. Only event tickets transact via Stripe today.
3. **No native mobile.** A diaspora platform whose target audience lives across timezones and includes a meaningful mobile-first cohort (especially in continental Africa) cannot stay web-only.
4. **No multilingual UI.** French, Portuguese, Swahili, Arabic, Amharic, Yoruba — none of these are even framework-ready (no i18n library in deps).
5. **No real governance/identity layer.** Who decides what's editorial? What's a "verified diaspora voice"? Where does the community vote? These are forward-looking but they're the *interesting* problems a diaspora platform exists to solve.
6. **No diaspora-graph intelligence at scale.** The DIA matching engine is rule-based with hand-tuned weights. There are embeddings columns but no clear path from "we've embedded users" → "we're recommending at the quality of LinkedIn or Bumble." That's a 6–12 month investment, and it's the *moat*.
7. **Rooms / live community surfaces are emerging but minimal.** The newest edge function (`dia-room-reasoning`, May 14) suggests "Rooms" are coming, but the surface isn't built yet.

### What I would do differently if starting fresh

1. **One canonical `users` table, slim:** `id`, `username`, `email`, `display_name`, `avatar_url`, `created_at`, `last_seen_at`. Everything else (heritage, skills, intentions, etc.) goes into joined tables, not 140 columns.
2. **One `roles` table.** Period. No mirror columns on `users`.
3. **One `community` entity that polymorphically represents groups/spaces/chapters.** Type discriminator on the row, not three tables.
4. **One `engagement_event` table** with strict event taxonomy, partitioned by date. Not five overlapping ledgers.
5. **Strict TypeScript from day one.** No `any`. Type augmentation via Zod schemas, validated at the supabase boundary.
6. **Routes in feature folders**, each with its own loader/action (or react-router data routing). Not one `App.tsx`.
7. **CI with type-check + lint + at least smoke tests of every page render** from day one. The cost of *not* having tests has compounded.
8. **Feature flags backed by `feature_flags` table** from day one — the table exists but isn't the driver of the UI.
9. **An eval harness for DIA.** Golden questions, expected behavior, rerun on every prompt change. This is what makes AI products reliable.
10. **Mobile-first layouts**, then enhance for desktop. Today's mobile views feel retrofit.
11. **Start with the affirmation moment.** Make joining DNA mean something — name the values, ask the question, take the time. Right now "I agree to the values" is a checkbox column (`agrees_to_values`) that is barely used.

### The single most important thing for the next AI partner to know

**DNA is two products in one: a community platform shaped by accreted decisions (Connect/Convene/Collaborate/Contribute/Convey + DIA + messaging + admin + analytics), and a movement narrative articulated through the Manifesto, Roadmap event, and brand voice. The next-phase architecture must serve both — but if forced to choose, serve the *narrative* first, because that's what the founder built that no one else has.**

Concretely: the data model can be refactored. The UI can be redesigned. The features can be re-prioritized. But the *commitment to the diaspora as a movement, not a SaaS market* is what gives DNA its reason to exist. Anything the next phase builds — Rooms, capital flow, governance, mobile, multilingual — should be evaluated against the question "Does this honor the manifesto, or does it dilute it?"

A second, more pragmatic note: the **Universal Composer + Feed + DIA loop is the proven product spine.** It's already where users spend their time, it's already where DIA can reason cross-C, and it's the only surface with mature pagination, real-time, and engagement instrumentation. The Phase 3 rebuild of COLLABORATE and CONTRIBUTE should plug into this spine, not parallel it.

---

*End of audit. ~ 12,500 words.*

> If something here looks wrong to you, it's almost certainly because the codebase has moved since this snapshot (commit `e1cdc66`) or because I couldn't verify a runtime fact from inside the repo (live user counts, revenue, RLS-deploy state, infra topology). Push back on those specifically and I'll dig deeper.

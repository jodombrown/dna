# DNA Platform — Supabase Schema Export

**Exported:** 2026-03-09  
**Source Project:** `ybhssuehmfnxrzneobok`  
**Purpose:** Complete database schema reference for platform rebuild

---

## TABLE OF CONTENTS

1. [Enums](#1-enums)
2. [Tables by Module](#2-tables-by-module)
3. [Database Functions](#3-database-functions)
4. [RLS Policies Summary](#4-rls-policies-summary)
5. [Views](#5-views)
6. [Storage Buckets](#6-storage-buckets)
7. [Rebuild Recommendations](#7-rebuild-recommendations)

---

## 1. ENUMS

```sql
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.attachment_type AS ENUM ('space', 'task', 'update');
CREATE TYPE public.contribution_need_priority AS ENUM ('normal', 'high');
CREATE TYPE public.contribution_need_status AS ENUM ('open', 'in_progress', 'fulfilled', 'closed');
CREATE TYPE public.contribution_need_type AS ENUM ('funding', 'skills', 'time', 'access', 'resources');
CREATE TYPE public.contribution_offer_status AS ENUM ('pending', 'accepted', 'declined', 'completed');
CREATE TYPE public.contribution_type AS ENUM ('time', 'expertise', 'network', 'capital');
CREATE TYPE public.event_format AS ENUM ('in_person', 'virtual', 'hybrid');
CREATE TYPE public.event_type AS ENUM ('conference', 'workshop', 'meetup', 'webinar', 'networking', 'social', 'other');
CREATE TYPE public.group_join_policy AS ENUM ('open', 'approval_required', 'invite_only');
CREATE TYPE public.group_member_role AS ENUM ('owner', 'admin', 'moderator', 'member');
CREATE TYPE public.group_privacy AS ENUM ('public', 'private', 'secret');
CREATE TYPE public.hashtag_status AS ENUM ('active', 'archived', 'suspended', 'reserved');
CREATE TYPE public.hashtag_type AS ENUM ('community', 'personal');
CREATE TYPE public.linked_entity_type AS ENUM ('event', 'space', 'need', 'story', 'community_post');
CREATE TYPE public.opportunity_status AS ENUM ('draft', 'active', 'paused', 'closed', 'archived');
CREATE TYPE public.opportunity_visibility AS ENUM ('public', 'network_only', 'private');
CREATE TYPE public.reserved_category AS ENUM ('country', 'public_figure', 'company', 'government', 'offensive');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending_verification', 'soft_verified', 'fully_verified', 'rejected');
```

---

## 2. TABLES BY MODULE

### Legend
- **PK** = Primary Key (all UUIDs with `gen_random_uuid()` default)
- **FK** = Foreign Key reference
- **RLS** = Row Level Security enabled (✅ on ALL tables)
- Column format: `name` | type | nullable | default

---

### 2.1 FOUNDATION — Auth, Profiles & Platform Core

#### `profiles` ⭐ (Central table — most referenced)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK, references auth.users |
| username | text | YES | |
| email | text | YES | |
| full_name | text | YES | |
| first_name | text | YES | |
| last_name | text | YES | |
| display_name | text | YES | |
| avatar_url | text | YES | |
| profile_picture_url | text | YES | |
| banner_url | text | YES | |
| headline | text | YES | |
| bio | text | YES | |
| intro_text | text | YES | |
| intro_audio_url | text | YES | |
| intro_video_url | text | YES | |
| diaspora_story | text | YES | |
| professional_role | text | YES | |
| profession | text | YES | |
| industry | text | YES | |
| company | text | YES | |
| venture_name | text | YES | |
| venture_stage | text | YES | |
| current_role | text | YES | |
| years_experience | int4 | YES | |
| location | text | YES | |
| current_location | text | YES | |
| current_city | text | YES | |
| current_region | text | YES | |
| current_country | text | YES | |
| current_country_name | text | YES | |
| country_of_origin | text | YES | |
| diaspora_origin | text | YES | |
| origin_country_name | text | YES | |
| years_in_diaspora | int4 | YES | |
| languages | text[] | YES | |
| skills | text[] | YES | |
| interests | text[] | YES | |
| interest_tags | text[] | YES | |
| sectors | text[] | YES | |
| professional_sectors | text[] | YES | |
| impact_areas | text[] | YES | |
| impact_regions | text[] | YES | |
| sdg_focus | text[] | YES | |
| available_for | text[] | YES | |
| offers | text[] | YES | |
| needs | text[] | YES | |
| networking_goals | text[] | YES | |
| skills_offered | text[] | YES | |
| skills_needed | text[] | YES | |
| engagement_intentions | text[] | YES | |
| mentorship_areas | text[] | YES | |
| diaspora_networks | text[] | YES | |
| focus_areas | text[] | YES | |
| regional_expertise | text[] | YES | |
| industries | text[] | YES | |
| linkedin_url | text | YES | |
| twitter_url | text | YES | |
| website_url | text | YES | |
| github_url | text | YES | |
| is_public | bool | YES | true |
| is_onboarded | bool | YES | false |
| onboarding_step | text | YES | |
| user_type | text | YES | 'member' |
| verified | bool | YES | false |
| verified_at | timestamptz | YES | |
| verification_status | verification_status | YES | 'unverified' |
| verification_method | text | YES | |
| verification_updated_at | timestamptz | YES | |
| mentorship_offering | bool | YES | false |
| seeking_mentorship | bool | YES | false |
| open_to_opportunities | bool | YES | false |
| profile_completeness_score | int4 | YES | 0 |
| profile_visibility | jsonb | YES | |
| visibility_settings | jsonb | YES | |
| theme_preference | text | YES | |
| created_at | timestamptz | NO | now() |
| updated_at | timestamptz | YES | now() |

#### `user_roles`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | FK → auth.users |
| role | app_role | NO | |
| created_at | timestamptz | YES | now() |
**Unique:** (user_id, role)

#### `users` (Legacy — prefer profiles)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| email | text | YES | |
| created_at | timestamptz | YES | now() |

#### `feature_flags`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| key | text | NO | |
| enabled | bool | NO | false |
| description | text | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `error_logs`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_id | uuid | YES | |
| error_type | text | NO | |
| error_message | text | NO | |
| stack_trace | text | YES | |
| route | text | YES | |
| metadata | jsonb | YES | |
| created_at | timestamptz | | now() |

---

### 2.2 CONNECT — Connections, Messaging, Blocking

#### `connections`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| requester_id | uuid | NO | FK → profiles |
| recipient_id | uuid | NO | FK → profiles |
| status | text | NO | |
| message | text | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `blocked_users`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| blocker_id | uuid | NO | |
| blocked_id | uuid | NO | |
| reason | text | YES | |
| created_at | timestamptz | | now() |

#### `conversations` (Legacy 1:1 DMs)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_a / user_b | uuid | NO | |
| last_message_at | timestamptz | YES | |
| is_archived_by_a/b | bool | YES | |
| is_muted_by_a/b | bool | YES | |
| is_pinned_by_a/b | bool | YES | |
| deleted_by_a/b | bool | YES | |
| created_at | timestamptz | | now() |

#### `conversations_new` (Unified messaging — use this)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| conversation_type | text | NO | 'direct' |
| title | text | YES | |
| created_by | uuid | YES | FK → profiles |
| origin_type | text | YES | |
| origin_id | uuid | YES | |
| metadata | jsonb | YES | |
| last_message_at | timestamptz | NO | now() |
| created_at / updated_at | timestamptz | | now() |

#### `conversation_participants`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| conversation_id | uuid | NO | FK → conversations_new |
| user_id | uuid | NO | |
| joined_at | timestamptz | | now() |
| last_read_at | timestamptz | | now() |

#### `messages` (Legacy)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| conversation_id | uuid | NO | |
| sender_id | uuid | NO | |
| content | text | NO | |
| message_type | text | YES | 'text' |
| metadata | jsonb | YES | |
| is_edited / is_deleted | bool | YES | false |
| created_at / updated_at | timestamptz | | now() |

#### `messages_new` (Unified messaging — use this)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| conversation_id | uuid | NO | FK → conversations_new |
| sender_id | uuid | NO | |
| content | text | YES | |
| message_type | text | NO | 'text' |
| metadata | jsonb | YES | |
| reply_to_id | uuid | YES | FK → messages_new |
| is_edited / is_deleted | bool | | false |
| created_at / updated_at | timestamptz | | now() |

#### `message_reactions`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| message_id | uuid | NO | |
| user_id | uuid | NO | |
| reaction | text | NO | |
| created_at | timestamptz | | now() |
**Unique:** (message_id, user_id, reaction)

#### `introductions`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| introducer_id | uuid | NO | |
| person_a_id / person_b_id | uuid | NO | |
| message | text | YES | |
| status | text | NO | 'pending' |
| created_at | timestamptz | | now() |

---

### 2.3 CONVENE — Events

#### `events` ⭐
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| organizer_id | uuid | YES | FK → profiles (nullable for curated) |
| title | text | NO | |
| description | text | YES | |
| short_description | text | YES | |
| event_type | event_type | YES | |
| format | event_format | YES | |
| start_date | timestamptz | NO | |
| end_date | timestamptz | YES | |
| timezone | text | YES | |
| location_name | text | YES | |
| location_address | text | YES | |
| location_city | text | YES | |
| location_country | text | YES | |
| location_lat / location_lng | float8 | YES | |
| virtual_link | text | YES | |
| virtual_platform | text | YES | |
| image_url | text | YES | |
| banner_url | text | YES | |
| tags | text[] | YES | |
| max_attendees | int4 | YES | |
| attendee_count | int4 | YES | 0 |
| is_free | bool | YES | true |
| ticket_price | numeric | YES | |
| ticket_currency | text | YES | 'USD' |
| is_published | bool | YES | false |
| is_featured | bool | YES | false |
| is_curated | bool | YES | false |
| curated_source | text | YES | |
| curated_source_url | text | YES | |
| status | text | YES | 'draft' |
| registration_deadline | timestamptz | YES | |
| cancellation_reason | text | YES | |
| c_module | text | YES | |
| space_id | uuid | YES | |
| community_id | uuid | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `event_registrations`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| event_id | uuid | NO | FK → events |
| user_id | uuid | NO | |
| status | text | NO | 'registered' |
| ticket_type_id | uuid | YES | |
| registration_answers | jsonb | YES | |
| checked_in | bool | YES | false |
| checked_in_at | timestamptz | YES | |
| created_at | timestamptz | | now() |
**Unique:** (event_id, user_id)

#### `event_ticket_types`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| event_id | uuid | NO | FK → events |
| name | text | NO | |
| description | text | YES | |
| price | numeric | NO | 0 |
| currency | text | YES | 'USD' |
| quantity | int4 | YES | |
| sold_count | int4 | YES | 0 |
| sort_order | int4 | YES | 0 |
| is_active | bool | YES | true |
| sale_start / sale_end | timestamptz | YES | |
| created_at | timestamptz | | now() |

#### `event_roles`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| event_id | uuid | NO | FK → events |
| user_id | uuid | NO | |
| role | text | NO | |
| permissions | jsonb | YES | '{}' |
| created_at | timestamptz | | now() |
**Unique:** (event_id, user_id)

#### `event_checkins`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| event_id | uuid | NO | FK → events |
| user_id | uuid | NO | |
| checked_in_by | uuid | YES | |
| method | text | YES | 'manual' |
| checked_in_at | timestamptz | | now() |

#### `event_comments`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| event_id | uuid | NO | FK → events |
| user_id | uuid | NO | |
| content | text | NO | |
| parent_id | uuid | YES | |
| created_at | timestamptz | | now() |

#### `event_analytics`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| event_id | uuid | NO | FK → events |
| event_type | text | NO | |
| user_id | uuid | YES | |
| metadata | jsonb | YES | |
| created_at | timestamptz | | now() |

#### Additional Event Tables
- `event_attendees` — Legacy attendance tracking
- `event_blasts` — Mass communications to attendees
- `event_promo_codes` — Discount codes
- `event_registration_questions` — Custom registration form fields
- `event_reminder_logs` — Reminder email tracking
- `event_reports` — Event abuse reports
- `event_ticket_holds` — Ticket reservation holds
- `event_tickets` — Individual issued tickets
- `event_waitlist` — Waitlist when events are full
- `events_log` — Event audit trail
- `events_old` — Legacy events table

---

### 2.4 COLLABORATE — Spaces, Tasks, Projects

#### `spaces` ⭐
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| created_by | uuid | NO | |
| title | text | NO | |
| description | text | YES | |
| cover_image_url | text | YES | |
| status | text | YES | 'active' |
| visibility | text | YES | 'public' |
| tags | text[] | YES | |
| health_score | int4 | YES | |
| max_members | int4 | YES | |
| space_type | text | YES | |
| c_module | text | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `space_members`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| space_id | uuid | NO | FK → spaces |
| user_id | uuid | NO | |
| role | text | NO | 'member' |
| status | text | NO | 'active' |
| joined_at | timestamptz | | now() |
**Unique:** (space_id, user_id)

#### `space_tasks`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| space_id | uuid | NO | FK → spaces |
| title | text | NO | |
| description | text | YES | |
| status | text | YES | 'todo' |
| priority | text | YES | 'medium' |
| assigned_to | uuid | YES | |
| created_by | uuid | NO | |
| due_date | timestamptz | YES | |
| completed_at | timestamptz | YES | |
| sort_order | int4 | YES | 0 |
| tags | text[] | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `space_updates`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| space_id | uuid | NO | FK → spaces |
| author_id | uuid | NO | |
| content | text | NO | |
| update_type | text | YES | 'general' |
| created_at | timestamptz | | now() |

#### Additional Collaborate Tables
- `space_activity_log` — Activity audit
- `space_attachments` — File attachments
- `space_roles` — Custom role definitions
- `space_task_dependencies` — Task dependency graph
- `space_templates` — Reusable space templates
- `collaboration_spaces` — Legacy collaboration spaces
- `collaboration_memberships` — Legacy memberships
- `tasks` — Legacy standalone tasks
- `task_comments` — Task discussion

---

### 2.5 CONTRIBUTE — Marketplace, Opportunities, Organizations

#### `opportunities` ⭐
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| organization_id | uuid | YES | FK → organizations |
| created_by | uuid | NO | |
| title | text | NO | |
| description | text | NO | |
| opportunity_type | text | NO | |
| status | opportunity_status | YES | 'draft' |
| visibility | opportunity_visibility | YES | 'public' |
| location | text | YES | |
| is_remote | bool | YES | false |
| salary_min / salary_max | numeric | YES | |
| salary_currency | text | YES | |
| application_deadline | timestamptz | YES | |
| required_skills | text[] | YES | |
| preferred_skills | text[] | YES | |
| experience_level | text | YES | |
| tags | text[] | YES | |
| view_count | int4 | YES | 0 |
| application_count | int4 | YES | 0 |
| created_at / updated_at | timestamptz | | now() |

#### `organizations`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| owner_user_id | uuid | NO | |
| name | text | NO | |
| description | text | YES | |
| logo_url | text | YES | |
| website_url | text | YES | |
| industry | text | YES | |
| size | text | YES | |
| location | text | YES | |
| verification_status | text | YES | 'pending' |
| verification_fee_paid | bool | YES | false |
| subscription_tier | text | YES | 'community' |
| opportunities_posted_this_year | int4 | YES | 0 |
| year_reset_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `applications`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_id | uuid | NO | FK → profiles |
| opportunity_id | uuid | NO | FK → opportunities |
| status | text | NO | |
| cover_letter | text | NO | |
| resume_url | text | YES | |
| applied_at / updated_at | timestamptz | | now() |

#### `contribution_needs`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| space_id | uuid | NO | FK → spaces |
| created_by | uuid | NO | |
| title | text | NO | |
| description | text | NO | |
| type | contribution_need_type | NO | |
| priority | contribution_need_priority | YES | 'normal' |
| status | contribution_need_status | YES | 'open' |
| target_amount | numeric | YES | |
| currency | text | YES | |
| time_commitment | text | YES | |
| duration | text | YES | |
| needed_by | timestamptz | YES | |
| focus_areas | text[] | YES | |
| region | text | YES | |
| created_at / updated_at | timestamptz | | now() |

#### `contribution_offers`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| need_id | uuid | NO | FK → contribution_needs |
| space_id | uuid | NO | FK → spaces |
| created_by | uuid | NO | |
| message | text | NO | |
| offered_amount | numeric | YES | |
| offered_currency | text | YES | |
| status | contribution_offer_status | YES | 'pending' |
| created_at / updated_at | timestamptz | | now() |

#### Additional Contribute Tables
- `contribution_cards` — Legacy contribution cards
- `opportunity_applications` — Legacy applications
- `opportunity_bookmarks` — Saved opportunities
- `opportunity_contributions` — Contribution tracking
- `opportunity_interests` — Interest expressions
- `organization_verification_requests` — Org verification
- `billing_transactions` — Payment records
- `platform_fees` — Fee configuration
- `sponsors` / `sponsor_placements` — Sponsorship system

---

### 2.6 CONVEY — Posts, Stories, Feed, Content

#### `posts` ⭐
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| author_id | uuid | NO | FK → profiles |
| content | text | YES | |
| post_type | text | YES | 'post' |
| media_urls | text[] | YES | |
| media_types | text[] | YES | |
| image_url | text | YES | |
| link_url | text | YES | |
| link_preview | jsonb | YES | |
| original_post_id | uuid | YES | (for reshares) |
| space_id | uuid | YES | |
| event_id | uuid | YES | |
| community_id | uuid | YES | |
| tags | text[] | YES | |
| visibility | text | YES | 'public' |
| is_pinned | bool | YES | false |
| is_deleted | bool | YES | false |
| is_featured | bool | YES | false |
| like_count | int4 | YES | 0 |
| comment_count | int4 | YES | 0 |
| share_count | int4 | YES | 0 |
| view_count | int4 | YES | 0 |
| engagement_score | float8 | YES | 0 |
| story_title | text | YES | |
| story_subtitle | text | YES | |
| story_hero_image_url | text | YES | |
| story_content | text | YES | |
| story_reading_time | int4 | YES | |
| story_published_at | timestamptz | YES | |
| created_at / updated_at | timestamptz | | now() |

**Note:** Stories are stored in `posts` with `post_type = 'story'`

#### `post_comments`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| post_id | uuid | NO | FK → posts |
| user_id | uuid | NO | |
| content | text | NO | |
| parent_id | uuid | YES | (for threaded replies) |
| is_deleted | bool | YES | false |
| created_at / updated_at | timestamptz | | now() |

#### `post_reactions`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| post_id | uuid | NO | FK → posts |
| user_id | uuid | NO | |
| reaction_type | text | NO | |
| created_at | timestamptz | | now() |
**Unique:** (post_id, user_id)

#### Feed Engagement Tables
- `feed_bookmarks` — Saved posts
- `feed_comments` — Feed-level comments
- `feed_engagement_events` — Engagement tracking
- `feed_reactions` — Feed reactions
- `feed_reshares` — Reshare tracking
- `post_analytics` — Post performance metrics
- `post_bookmarks` — Bookmarked posts
- `post_likes` — Legacy like tracking
- `post_shares` — Share tracking
- `post_views` — View tracking
- `post_reports` — Content abuse reports
- `hidden_posts` — User-hidden content
- `muted_authors` — Muted user tracking
- `saved_posts` — Saved posts (legacy)

#### Hashtags System
- `hashtags` — Hashtag definitions (type, status, owner, follower_count)
- `hashtag_analytics` — Usage analytics
- `hashtag_followers` — Follower tracking
- `hashtag_usage_requests` — Usage requests for reserved hashtags
- `post_hashtags` — Post-hashtag junction
- `reserved_hashtags` — Reserved hashtag names

---

### 2.7 DIA — Diaspora Intelligence Agent

#### `dia_queries`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_id | uuid | YES | |
| query_text | text | NO | |
| response_text | text | YES | |
| source | text | YES | |
| tokens_used | int4 | YES | |
| estimated_cost | numeric | YES | |
| model_used | text | YES | |
| expires_at | timestamptz | YES | |
| created_at | timestamptz | | now() |

#### `dia_query_log`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_id | uuid | YES | |
| query_text | text | NO | |
| response_time_ms | int4 | YES | |
| cache_hit | bool | YES | false |
| model_used | text | YES | |
| created_at | timestamptz | | now() |

#### `dia_user_usage`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_id | uuid | NO | |
| queries_today | int4 | YES | 0 |
| queries_this_month | int4 | YES | 0 |
| last_query_at | timestamptz | YES | |
| reset_date | date | YES | |

#### `dia_insights`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| user_id | uuid | YES | |
| insight_type | text | NO | |
| content | text | NO | |
| metadata | jsonb | YES | |
| is_dismissed | bool | YES | false |
| created_at | timestamptz | | now() |

#### ADIN Tables (DIA Intelligence sub-system)
- `adin_nudges` — Connection nudges (kickstart, follow-up, etc.)
- `adin_preferences` — User notification preferences
- `adin_recommendations` — AI-generated recommendations
- `adin_signals` — Market/opportunity signals
- `adin_contributor_requests` — Contributor verification requests

---

### 2.8 COMMUNITIES & GROUPS

#### `communities`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| created_by | uuid | NO | FK → auth.users |
| name | text | NO | |
| description | text | YES | |
| category | text | YES | |
| image_url | text | YES | |
| cover_image_url | text | YES | |
| tags | text[] | YES | |
| member_count | int4 | YES | 0 |
| is_active | bool | NO | true |
| is_featured | bool | YES | false |
| moderation_status | text | YES | |
| purpose_goals | text | YES | |
| created_at / updated_at | timestamptz | | now() |

- `community_memberships` — Member roles & status
- `community_posts` — Community content
- `community_events` — Community-specific events
- `community_event_attendees` — Event RSVPs

#### `groups` (Separate from communities)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | PK |
| created_by | uuid | NO | |
| name | text | NO | |
| description | text | YES | |
| privacy | group_privacy | YES | 'public' |
| join_policy | group_join_policy | YES | 'open' |
| image_url | text | YES | |
| member_count | int4 | YES | 0 |
| created_at / updated_at | timestamptz | | now() |

- `group_members` — Membership with roles (group_member_role)
- `group_messages` — Group chat
- `group_conversations` — Group conversation threads
- `group_posts` — Group posts
- `group_post_comments` / `group_post_likes` — Engagement
- `group_join_requests` — Join request management

---

### 2.9 IMPACT & GAMIFICATION

- `impact_log` — Action tracking (type, pillar, points, description)
- `impact_badges` — Badge awards
- `impact_attributions` — Impact attribution tracking
- `user_dna_points` — Five C's point breakdown (connect_score, convene_score, collaborate_score, contribute_score, convey_score, total_score)
- `user_badges` — Badge unlocks (badge_type, badge_name, icon)
- `badge_definitions` — Badge catalog (slug, category, tier, criteria)
- `user_engagement_tracking` — Engagement metrics
- `skill_analytics` — Skill usage tracking
- `skill_connections` — Skill-based connections

---

### 2.10 GEOGRAPHY & REFERENCE DATA

- `continents` — Continent reference
- `regions` — African regions (West, East, etc.)
- `countries` — Country profiles with rich metadata (population, GDP, diaspora estimates, key sectors, flag URLs, hero images)
- `provinces` — Sub-national divisions
- `diaspora_data` — Diaspora statistics
- `economic_indicators` — Economic data
- `innovation_data` — Innovation metrics
- `political_digest` — Political context
- `geographic_relevance` — Geo-relevance scoring

---

### 2.11 ADMIN & ANALYTICS

- `admin_activity_log` — Admin action audit trail
- `analytics_events` — Platform analytics
- `dashboard_analytics` — Dashboard metrics
- `cron_job_logs` — Scheduled job logs
- `content_flags` / `content_moderation` — Moderation system
- `alpha_feedback` — User feedback (category, area, content)

---

### 2.12 NOTIFICATIONS & ENGAGEMENT

- `notifications` — User notifications (type, title, message, payload, link_url, read/seen)
- `nudges` — Engagement nudges
- `push_subscriptions` — Web push tokens
- `newsletter_subscriptions` — Email subscriptions

---

### 2.13 MISC & LEGACY

- `beta_waitlist` — Waitlist signups
- `invites` — Invitation system
- `milestones` — Project milestones
- `monthly_reports` — Generated reports
- `projects` / `project_contributions` — Legacy project system
- `releases` / `release_features` — Release notes
- `username_history` — Username change tracking
- `user_onboarding_selections` — Onboarding flow data
- `user_last_view_state` — ADA view state persistence
- `user_dashboard_preferences` — Dashboard customization
- `search_preferences` — Search settings
- `profile_completion` — Completion tracking
- `profile_views` — Profile view analytics
- `profile_causes` / `profile_skills` — Legacy junction tables
- `user_follows` — Follow relationships
- `user_interactions` — Interaction tracking
- `user_recommendations` — People recommendations
- `user_communities` — Community membership cache
- `user_adin_profile` — DIA user profile
- `verified_contributors` — Verified contributor list
- `entity_vectors` / `user_vectors` — Vector embeddings for search
- `hub_metrics` — Hub dashboard metrics
- `initiatives` — Initiative tracking
- `rate_limit_checks` — Rate limiting data
- `waitlist_signups` — Legacy waitlist
- `causes` / `skills` — Reference data
- `feed_research_responses` — Research survey data
- `feedback_channels` / `feedback_channel_memberships` / `feedback_messages` / `feedback_reactions` / `feedback_attachments` — Internal feedback system

---

## 3. DATABASE FUNCTIONS (Key Functions)

### Auth & Permissions
```sql
-- Check if current user is admin
has_role(_user_id uuid, _role app_role) → boolean [SECURITY DEFINER]
is_admin() → boolean [SECURITY DEFINER]
is_connection_participant(p_connection uuid) → boolean [SECURITY DEFINER]
are_users_connected(u1 uuid, u2 uuid) → boolean [SECURITY DEFINER]
can_message_user(p_sender_id uuid, p_recipient_id uuid) → boolean
can_send_messages(user_id_param uuid) → boolean
can_create_collaboration(user_id_param uuid) → boolean
can_post_opportunity(_org_id uuid) → boolean
can_view_field(p_visibility jsonb, p_field text, p_viewer uuid, p_owner uuid) → boolean
check_event_permission(p_event_id uuid, p_user_id uuid, p_permission text) → boolean
check_username_available(p_username text, p_user_id uuid) → boolean
```

### Profile & Scoring
```sql
calculate_profile_completeness(target_user_id uuid) → integer
calculate_profile_completion_percentage(profile_id uuid) → integer
compute_profile_completion_score(profile_record profiles) → integer
calculate_impact_score(target_user_id uuid) → integer
compute_influence_score(target_user_id uuid) → integer
check_badge_unlocks(target_user_id uuid) → void
admin_verify_user(target_user_id uuid, admin_user_id uuid) → boolean
```

### Connections
```sql
accept_connection(p_connection uuid) → void
block_user(p_blocked_user_id uuid, p_reason text) → void
send_connection_request_v2(p_to uuid, p_msg text, p_intent text) → uuid
```

### Messaging
```sql
create_conversation_with_participant(p_other_user_id uuid) → uuid
add_group_participant(p_conversation_id uuid, p_user_id uuid) → void
add_message_reaction(p_message_id uuid, p_user_id uuid, p_reaction text) → void
send_message_new(p_conversation_id uuid, p_content text, p_type text, p_metadata jsonb) → uuid
```

### Notifications
```sql
add_notification(p_user_id uuid, p_type text, p_title text, p_message text, ...) → uuid
```

### Events
```sql
create_event_feed_post() → trigger  -- Auto-creates feed post on event publish
update_event_attendee_count(p_event_id uuid) → void
_on_event_reg_change() → trigger
```

### Content
```sql
create_entity_feed_post(p_entity_type, p_entity_id, p_author_id, ...) → uuid
check_user_reshared(p_user_id uuid, p_post_id uuid) → boolean
```

### Triggers
```sql
-- Auto-membership on space/collaboration creation
add_creator_as_member() → trigger
create_collab_owner_membership() → trigger
auto_add_group_owner() → trigger

-- Verification auto-check on profile update
check_and_update_verification() → trigger

-- Auto-join feedback channels
auto_join_feedback_channel() → trigger
```

### Matching & Search
```sql
calculate_match_score(profile_id uuid, signal_id uuid) → integer
calculate_match_score(user1_regions, user1_sectors, user2_regions, user2_sectors) → numeric
cosine_similarity(vec1 jsonb, vec2 jsonb) → float8
```

---

## 4. RLS POLICIES SUMMARY

**All 160+ tables have RLS enabled.** Common patterns:

| Pattern | Used On | Logic |
|---------|---------|-------|
| **Owner read/write** | profiles, preferences, feedback | `auth.uid() = user_id` |
| **Admin full access** | admin tables, moderation | `has_role(auth.uid(), 'admin')` or `is_admin()` |
| **Public read, owner write** | posts, events, communities | `SELECT: true`, `INSERT/UPDATE: auth.uid() = author_id` |
| **Member access** | spaces, groups, conversations | Join check via membership table |
| **Connection-based** | messages, introductions | `are_users_connected()` or participant check |
| **Service role only** | nudges insert, system tables | `roles: {service_role}` |

---

## 5. VIEWS

```sql
-- Public-safe profile view
CREATE VIEW public_profiles AS
  SELECT id, username, display_name, full_name, avatar_url, ...
  FROM profiles WHERE is_public = true;

-- Impact aggregation
CREATE VIEW user_impact_summary AS
  SELECT user_id, count(*) total_actions, sum(points) total_points, ...
  FROM impact_log GROUP BY user_id;

-- DIA analytics views
CREATE VIEW adin_cost_tracking AS ...  -- Daily cost breakdown
CREATE VIEW adin_daily_stats AS ...    -- Cache hit rates, response times
CREATE VIEW adin_popular_queries AS ... -- Most common queries
```

---

## 6. STORAGE BUCKETS

| Bucket | Public | Size Limit | Allowed Types |
|--------|--------|-----------|---------------|
| `avatars` | ✅ | — | any |
| `banners` | ✅ | — | any |
| `event-images` | ✅ | 10MB | image/*, video/* |
| `event-media` | ✅ | — | any |
| `feedback-media` | ✅ | — | any |
| `message-attachments` | ✅ | — | any |
| `messages` | ✅ | 50MB | image/*, audio/*, video/*, pdf |
| `organization-logos` | ✅ | 5MB | image/* |
| `post-media` | ✅ | 10MB | image/*, video/*, pdf, docx |
| `profile-images` | ✅ | 5MB | image/* |
| `profile-pictures` | ✅ | 5MB | image/* |
| `space-attachments` | ❌ | — | any |
| `story-hero-images` | ✅ | — | any |
| `user-posts` | ✅ | 10MB | image/*, video/* |

---

## 7. REBUILD RECOMMENDATIONS

### Tables to KEEP (proven, well-structured)
1. **profiles** — Rich, well-evolved schema. Keep as-is.
2. **user_roles** — Proper role-based auth. Keep.
3. **connections** — Clean requester/recipient pattern. Keep.
4. **events** — Comprehensive event system. Keep.
5. **event_registrations** — Solid. Keep.
6. **posts** — Unified post+story model. Keep.
7. **spaces** / **space_members** / **space_tasks** — Good patterns. Keep.
8. **contribution_needs** / **contribution_offers** — Good enums. Keep.
9. **opportunities** / **organizations** — Well-designed. Keep.
10. **conversations_new** / **conversation_participants** / **messages_new** — Unified messaging. Keep.
11. **countries** / **regions** / **continents** — Rich reference data. Keep.
12. **hashtags** system — Well-designed. Keep.
13. **dia_queries** / **dia_query_log** — DIA intelligence. Keep.

### Tables to CONSOLIDATE in rebuild
- `conversations` (legacy) → merge into `conversations_new`
- `messages` (legacy) → merge into `messages_new`
- `collaboration_spaces` → merge into `spaces`
- `collaboration_memberships` → merge into `space_members`
- `events_old` → drop
- `tasks` → merge into `space_tasks`
- Multiple profile completion functions → consolidate to one

### Tables to DROP (likely unused/redundant)
- `Bucket Number 1` (storage bucket)
- `events_old`
- `contact_requests` (if fully replaced by `connections`)
- Duplicate engagement tables (pick one pattern)

### Functions to KEEP
- `has_role` / `is_admin` — Core auth
- `are_users_connected` — Connection checks
- `create_conversation_with_participant` — Messaging
- `check_and_update_verification` — Auto-verification trigger
- `add_creator_as_member` — Space auto-membership
- `cosine_similarity` — Vector search

### Functions to CONSOLIDATE
- 5 different `calculate_profile_*` functions → 1 canonical version
- 2 `calculate_match_score` overloads → 1 clean version

---

*This document is the authoritative schema reference for the DNA platform rebuild. Use it alongside `docs/DNA-CODEBASE-AUDIT-HANDOFF.md` for the complete handoff package.*

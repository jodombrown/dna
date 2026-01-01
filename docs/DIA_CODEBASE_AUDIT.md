# DIA (Diaspora Intelligence Agent) Codebase Audit

**Audit Date:** January 1, 2026
**Auditor:** Claude Code
**Repository:** DNA (Diaspora Network Africa)

---

## Executive Summary

DIA (Diaspora Intelligence Agent) is a functional AI-powered intelligence layer that provides search capabilities, nudge recommendations, and network matching for the DNA platform. Here are the key findings:

1. **Mature Search Implementation**: DIA search is fully operational with Perplexity API integration, 24-hour caching, rate limiting (10 queries/month free tier), and network matching across 6 content types.

2. **Comprehensive Nudge System**: 15+ nudge types are supported across 4 categories (connection, content, engagement, contribute) with scheduled generation, user preferences, and snooze/dismiss functionality.

3. **Pillar-Aware Configuration**: DIA adapts its behavior based on which DNA pillar (Connect, Convene, Collaborate, Contribute, Convey) the user is in, with customized suggestions and result weighting.

4. **Legacy Naming**: Database tables use "ADIN" prefix (African Diaspora Intelligence Network) while UI consistently displays "DIA" - functional but creates maintenance confusion.

5. **Type Safety Gaps**: ~15 `any` types found in DIA-related files, primarily in Supabase client interactions and error handling.

6. **Naming Issue Found**: 2 instances of "AI assistant" instead of "Agent" in user-facing text require update.

7. **No Pulse Bar Integration**: Current implementation lacks scoring/ranking intelligence for a Pulse Bar feature.

8. **Limited Proactive Triggers**: Nudges are generated via scheduled jobs (cron), not real-time event reactions.

9. **Strong Event Infrastructure**: 30+ database triggers and Supabase realtime subscriptions provide foundation for future automation.

10. **No Security Concerns**: API keys are properly stored in environment variables; no exposed secrets found.

---

## 1. DIA File Inventory

### Core Components

| File Path | Lines | Purpose | Notes |
|-----------|-------|---------|-------|
| `src/components/dia/DiaSearch.tsx` | 814 | Main search interface with Perplexity integration | Most critical file |
| `src/components/dia/DiaPanel.tsx` | 100 | Container with tabbed interface (Search/History) | Dashboard widget |
| `src/components/dia/DiaHistory.tsx` | 190 | Past queries with re-run functionality | Uses dia_query_log |
| `src/components/dia/DiaInsights.tsx` | 80+ | Featured insights by category | Uses dia_insights table |
| `src/components/dia/DiaInsightOfDay.tsx` | 90 | Daily rotating featured insight | Calendar-based rotation |
| `src/components/dia/DiaContextual.tsx` | 50+ | Pillar-aware DIA with mobile variants | Uses pillarDiaConfigs |
| `src/components/dia/DiaProfileCard.tsx` | 50+ | Profile result card | Network match display |
| `src/components/dia/DiaStoryCard.tsx` | 50+ | Story result card | Convey integration |
| `src/components/dia/DiaHashtagChip.tsx` | 115 | Trending hashtag display | Flame animation |
| `src/components/dia/DiaOpportunityCard.tsx` | 50+ | Contribution opportunity card | Contribute integration |
| `src/components/dia/NudgeCard.tsx` | 199 | Individual nudge display | 9+ nudge types |
| `src/components/dia/index.ts` | 12 | Component exports | - |

### Hooks

| File Path | Lines | Purpose | Notes |
|-----------|-------|---------|-------|
| `src/hooks/useDiaNudges.ts` | 167 | Nudge fetching with realtime subscription | Uses adin_nudges table |
| `src/hooks/useDiaPreferences.ts` | 102 | User preferences CRUD | Uses adin_preferences |

### Configuration

| File Path | Lines | Purpose | Notes |
|-----------|-------|---------|-------|
| `src/config/dia-pillar-config.ts` | 145 | Pillar-specific DIA behavior | 7 pillar configs |

### Pages

| File Path | Lines | Purpose | Notes |
|-----------|-------|---------|-------|
| `src/pages/dna/DiaPage.tsx` | 85 | Full DIA page (Search/Insights/History tabs) | Main entry point |
| `src/pages/DiaPreferences.tsx` | 277 | User notification settings | Frequency, categories, quiet hours |
| `src/pages/NudgeCenter.tsx` | 224 | Nudge management hub | Pending/Snoozed/Done tabs |
| `src/pages/admin/DiaAdminPage.tsx` | 344 | Admin dashboard | Usage, costs, popular queries |

### Edge Functions

| File Path | Lines | Purpose | Notes |
|-----------|-------|---------|-------|
| `supabase/functions/dia-search/index.ts` | 535 | Core intelligence function | Perplexity + network matching |
| `supabase/functions/adin-hub-intelligence/index.ts` | 351 | Regional hub data aggregation | Multi-pillar feeds |
| `supabase/functions/adin-nightly-health/index.ts` | 125 | Connection health scoring | Delta calculations |
| `supabase/functions/trigger-adin-prompt/index.ts` | 70 | Event-triggered DIA prompts | RPC-based |
| `supabase/functions/generate-connect-nudges/index.ts` | 112 | Connection nudge generation | Scheduled |
| `supabase/functions/generate-opportunity-nudges/index.ts` | 491 | Opportunity matching nudges | Scheduled |
| `supabase/functions/engagement-reminders/index.ts` | 243 | Engagement tier nudges | Scheduled |
| `supabase/functions/connection-health-analyzer/index.ts` | 231 | Weak connection detection | Scheduled |

### Services

| File Path | Lines | Purpose | Notes |
|-----------|-------|---------|-------|
| `src/services/spaceHealthService.ts` | 649 | Space health calculations + nudges | Comprehensive scoring |
| `src/services/opportunityMatchingService.ts` | 715 | Skills-based opportunity matching | Multi-factor matching |
| `src/services/ada/AdaptiveConfigService.ts` | 308 | Adaptive policy resolution | ADA Phase 4 |

### Database Tables

| Table Name | Purpose | Key Columns |
|------------|---------|-------------|
| `adin_nudges` | Core nudge storage | user_id, nudge_type, message, status, payload |
| `adin_preferences` | User notification settings | notification_frequency, nudge_categories, quiet_hours |
| `adin_queries` (alias: `dia_queries`) | Query cache | query_hash, perplexity_response, network_matches |
| `adin_user_usage` (alias: `dia_user_usage`) | Rate limiting | query_count, query_limit, period_start |
| `adin_query_log` (alias: `dia_query_log`) | Query analytics | query_text, cache_hit, response_time_ms, source |
| `adin_daily_stats` | Admin daily metrics | total_queries, cache_hit_rate, unique_users |
| `adin_popular_queries` | Popular queries view | query_text, query_count, unique_users |
| `adin_cost_tracking` | API cost tracking | date, total_tokens, total_cost |
| `dia_insights` | Featured insights | title, content, category, display_order |

**Total DIA-related files: 30+ active implementation files**
**Total lines of code: ~5,000+**

---

## 2. DIA Architecture Overview

### Text-Based Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                USER INTERACTION                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│   │  DiaSearch   │    │  DiaPanel    │    │ DiaContextual│    │  NudgeCard   │   │
│   │ (Main Search)│    │ (Dashboard)  │    │(Pillar-aware)│    │(Notifications)│  │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘   │
│          │                   │                   │                   │           │
│          └───────────────────┼───────────────────┘                   │           │
│                              │                                       │           │
│                              ▼                                       ▼           │
│                    ┌─────────────────┐                     ┌─────────────────┐   │
│                    │ pillarDiaConfigs│                     │  useDiaNudges   │   │
│                    │ (Configuration) │                     │     (Hook)      │   │
│                    └────────┬────────┘                     └────────┬────────┘   │
│                             │                                       │            │
├─────────────────────────────┼───────────────────────────────────────┼────────────┤
│                           EDGE FUNCTIONS                            │            │
├─────────────────────────────┼───────────────────────────────────────┼────────────┤
│                             ▼                                       │            │
│                    ┌─────────────────┐                              │            │
│                    │   dia-search    │                              │            │
│                    │ (Edge Function) │                              │            │
│                    └────────┬────────┘                              │            │
│                             │                                       │            │
│         ┌───────────────────┼───────────────────┐                   │            │
│         │                   │                   │                   │            │
│         ▼                   ▼                   ▼                   │            │
│  ┌──────────────┐  ┌──────────────┐   ┌──────────────┐              │            │
│  │ Perplexity   │  │ DNA Network  │   │   Caching    │              │            │
│  │   API Call   │  │   Matching   │   │  (24-hour)   │              │            │
│  └──────────────┘  └──────────────┘   └──────────────┘              │            │
│                             │                                       │            │
├─────────────────────────────┼───────────────────────────────────────┼────────────┤
│                      SCHEDULED JOBS (Nudge Generation)              │            │
├─────────────────────────────┼───────────────────────────────────────┼────────────┤
│                             │                                       │            │
│  ┌──────────────┐  ┌────────┴────────┐  ┌──────────────┐  ┌────────┴────────┐   │
│  │generate-conn-│  │generate-opport- │  │engagement-   │  │connection-health│   │
│  │ect-nudges    │  │unity-nudges     │  │reminders     │  │-analyzer        │   │
│  └──────┬───────┘  └────────┬────────┘  └──────┬───────┘  └────────┬────────┘   │
│         │                   │                   │                   │            │
│         └───────────────────┼───────────────────┼───────────────────┘            │
│                             │                   │                                │
│                             ▼                   ▼                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                              DATABASE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │ adin_nudges  │  │adia_queries  │  │ adin_user_   │  │ adin_prefer- │         │
│   │              │  │ (cache)      │  │ usage        │  │ ences        │         │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                                   │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  profiles    │  │   events     │  │   spaces     │  │contribution_ │         │
│   │              │  │              │  │              │  │   needs      │         │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                                   │
│                    ◄── REALTIME SUBSCRIPTIONS (Supabase) ──►                      │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: User Search Query

```
User → DiaSearch.tsx → supabase.functions.invoke('dia-search')
                              │
                              ▼
                      dia-search/index.ts
                              │
                   ┌──────────┴──────────┐
                   ▼                     ▼
            Check Cache            Check Rate Limit
            (query_hash)           (user_usage)
                   │                     │
                   └──────────┬──────────┘
                              │
                   ┌──────────┴──────────┐
                   ▼                     ▼
            [Cache Hit]           [Cache Miss]
                   │                     │
                   │              ┌──────┴──────┐
                   │              ▼             ▼
                   │        Perplexity    Network Match
                   │        API Call      (profiles,
                   │                       events,
                   │                       projects,
                   │                       hashtags,
                   │                       stories,
                   │                       opportunities)
                   │              │             │
                   │              └──────┬──────┘
                   │                     │
                   │              ┌──────┴──────┐
                   │              ▼             ▼
                   │         Store Cache   Update Usage
                   │                     │
                   └──────────┬──────────┘
                              ▼
                      Log Query (analytics)
                              │
                              ▼
                      Return Response
                              │
                              ▼
                 DiaSearch.tsx renders:
                   - AI Answer
                   - Citations
                   - Network Matches (Profiles, Events, etc.)
```

---

## 3. DIA Capabilities Inventory

| Capability | Status | Implementation Location | Notes |
|------------|--------|------------------------|-------|
| Chat/Q&A (Perplexity) | ✅ | `supabase/functions/dia-search/index.ts` | Sonar model, 1024 max tokens |
| Web search | ✅ | `supabase/functions/dia-search/index.ts` | Via Perplexity with citations |
| User context awareness | ⚠️ | `src/config/dia-pillar-config.ts` | Pillar-based, not user profile-based |
| Profile recommendations | ✅ | `dia-search/index.ts:156-198` | Keyword-based matching |
| Event recommendations | ✅ | `dia-search/index.ts:200-225` | Future events, topic matching |
| Project/Space insights | ✅ | `dia-search/index.ts:227-249` | Active spaces only |
| Hashtag matching | ✅ | `dia-search/index.ts:251-269` | By usage count |
| Story matching | ✅ | `DiaSearch.tsx` (client-side) | Author, hashtags included |
| Opportunity matching | ✅ | `dia-search/index.ts:271-302` | Type, region, focus areas |
| Nudge generation | ✅ | 4 scheduled edge functions | Connection, opportunity, engagement, health |
| Nudge delivery | ✅ | `useDiaNudges.ts` + realtime | In-app with preferences |
| Nudge snooze/dismiss | ✅ | `useDiaNudges.ts` | 30-day snooze supported |
| Query caching | ✅ | `dia-search/index.ts` | 24-hour TTL, SHA-256 hash |
| Rate limiting | ✅ | `dia-search/index.ts:362-405` | 10/month free tier |
| Cost tracking | ✅ | `adin_cost_tracking` table | Per-query estimation |
| Admin dashboard | ✅ | `src/pages/admin/DiaAdminPage.tsx` | Usage, costs, popular queries |
| User preferences | ✅ | `src/pages/DiaPreferences.tsx` | Frequency, categories, quiet hours |
| Daily insights | ✅ | `DiaInsightOfDay.tsx` | Calendar-based rotation |
| Category insights | ✅ | `DiaInsights.tsx` | Fintech, energy, tech, etc. |
| Behavior pattern tracking | ❌ | Not implemented | No user behavior analytics |
| Proactive event triggers | ⚠️ | `trigger-adin-prompt` (RPC-based) | Limited implementation |
| Pulse Bar intelligence | ❌ | Not implemented | No scoring/ranking system |
| Cross-module synthesis | ⚠️ | Pillar config only | No unified synthesis engine |

**Legend:** ✅ Working | ⚠️ Partial/Limited | ❌ Not Implemented

---

## 4. Data Access Audit

| Data Type | Access | Method | Location |
|-----------|--------|--------|----------|
| User profile | ✅ Partial | Direct query (public profiles only) | `dia-search:181-198` |
| User connections | ❌ No | Not queried | - |
| User's events (created) | ❌ No | Not filtered by creator | - |
| User's events (attending) | ❌ No | Not filtered by attendance | - |
| User's projects/spaces | ❌ No | Not filtered by membership | - |
| User's tasks | ❌ No | Not accessed | - |
| User's marketplace listings | ❌ No | Not accessed | - |
| User's posts/stories | ❌ No | Stories matched by keyword only | - |
| User's messages | ❌ No | Not accessed (privacy) | - |
| User behavior/activity log | ❌ No | No tracking implemented | - |
| Platform-wide profiles | ✅ Yes | `profiles` table (is_public=true) | `dia-search:181-186` |
| Platform-wide events | ✅ Yes | `events` table (future, public) | `dia-search:206-214` |
| Platform-wide spaces | ✅ Yes | `collaboration_spaces` (active) | `dia-search:233-238` |
| Platform-wide hashtags | ✅ Yes | `hashtags` table | `dia-search:254-259` |
| Platform-wide opportunities | ✅ Yes | `contribution_needs` (open/in_progress) | `dia-search:278-288` |
| Platform-wide stories | ⚠️ Limited | Client-side in response only | `DiaSearch.tsx` |

### Key Observation
DIA currently has **no access to user-specific data** beyond their authentication. It searches platform-wide public content based on query keywords. For true personalization, DIA would need:
- User's skill profile
- User's interests/focus areas
- User's connection graph
- User's engagement history
- User's contribution history

---

## 5. External Integrations

| Service | Purpose | Integration Method | Config Location | Status |
|---------|---------|-------------------|-----------------|--------|
| Perplexity AI | Web search & AI answers | REST API (Bearer token) | `PERPLEXITY_API_KEY` env var | ✅ Working |
| OpenAI (GPT-4o-mini) | Search intent analysis | REST API (Bearer token) | `OPENAI_API_KEY` env var | ✅ Working |
| OpenAI (Whisper) | Voice transcription | REST API (Bearer token) | `OPENAI_API_KEY` env var | ⚠️ Disabled |

### Perplexity Integration Details

- **Endpoint:** `https://api.perplexity.ai/chat/completions`
- **Model:** `sonar`
- **Temperature:** `0.2` (factual responses)
- **Max tokens:** `1024`
- **Search recency:** `month` (prefers recent info)
- **Authentication:** Bearer token via environment variable
- **Rate limiting:** 10 queries/month free tier (database-tracked)
- **Caching:** 24-hour TTL with SHA-256 hash key
- **Cost estimation:** `(tokens * $0.000001) + $0.005` per request

### Error Handling
- HTTP status validation on all API calls
- Graceful fallback on Perplexity errors
- User-friendly error messages
- Query logging for analytics

### Security Notes
- ✅ No API keys exposed in client-side code
- ✅ Keys stored in environment variables
- ✅ Service role access only via edge functions
- ⚠️ Voice transcription disabled pending API key config

---

## 6. Event/Trigger System Audit

### Database Triggers (DIA-Related)

| Trigger | Table | Event | Purpose |
|---------|-------|-------|---------|
| (None specifically for DIA) | - | - | DIA uses scheduled functions instead |

### Supabase Realtime Subscriptions

| Component | Table | Events | Purpose |
|-----------|-------|--------|---------|
| `useDiaNudges` | `adin_nudges` | `*` (all) | Live nudge updates |

### Scheduled Edge Functions (Nudge Generation)

| Function | Schedule | Purpose |
|----------|----------|---------|
| `generate-connect-nudges` | Cron (config) | First connections, reengagement |
| `generate-opportunity-nudges` | Cron (config) | Opportunity matching |
| `engagement-reminders` | Cron (config) | Dormant users, at-risk |
| `connection-health-analyzer` | Cron (config) | Weak connection detection |
| `adin-nightly-health` | Nightly | Connection health scoring |

### Event-Driven Capabilities Assessment

**Current State:**
- ✅ Scheduled nudge generation works
- ✅ Realtime nudge delivery works
- ⚠️ `trigger-adin-prompt` RPC exists but limited usage
- ❌ No real-time event reactions (e.g., "when user connects, suggest...")
- ❌ No event bus/queue for complex workflows

**Gap:** DIA cannot currently react to events in real-time. All intelligence is either on-demand (search) or scheduled (nudges).

---

## 7. Nudge System Deep Dive

### Nudge Types (15 total)

**Connection Nudges:**
- `first_connections` - New users with 0 connections
- `reengagement` - Users inactive >7 days
- `new_connections` - Engagement tier nudges
- `weak_connection` - Fading connections (60+ days)
- `kickstart` - Initial engagement

**Content Nudges:**
- `at_risk_post` - Post engagement declining
- `popular_post` - High-performing content

**Engagement Nudges:**
- `dormant_comeback` - Dormant users
- `profile_incomplete` - Profile completion

**Opportunity Nudges:**
- `opportunity_match` - Skills/interests match
- `opportunity_trending` - High-priority needs
- `contribution_impact` - Validated contributions

**Space Health Nudges:**
- `space_stalling` - 7-14 days inactive
- `space_at_risk` - 14+ days inactive or >50% overdue
- `space_almost_complete` - 80%+ task completion
- `space_inactive_archive` - 30+ days inactive

### Nudge Flow

```
Scheduled Function → Eligibility Check → Generate Message → Insert adin_nudges
                                                                    │
                                                                    ▼
                                                          Supabase Realtime
                                                                    │
                                                                    ▼
                                                          useDiaNudges hook
                                                                    │
                                                                    ▼
                                                          NudgeCard renders
                                                                    │
                                                      ┌─────────────┼─────────────┐
                                                      ▼             ▼             ▼
                                                   Accept       Dismiss       Snooze
                                                      │             │             │
                                                      └─────────────┴─────────────┘
                                                                    │
                                                                    ▼
                                                          Update adin_nudges status
```

### Database Tables

```sql
-- adin_nudges
CREATE TABLE adin_nudges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  connection_id UUID,  -- or space_id for space nudges
  nudge_type TEXT,     -- CHECK constraint for valid types
  message TEXT,
  status TEXT,         -- 'sent' | 'accepted' | 'dismissed' | 'snoozed'
  payload JSONB,       -- action_url, priority, match_reasons, etc.
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);

-- adin_preferences
CREATE TABLE adin_preferences (
  user_id UUID PRIMARY KEY,
  notification_frequency TEXT,  -- 'never' | 'low' | 'normal' | 'high'
  nudge_categories TEXT[],      -- ['connection', 'content', 'engagement', 'contribute']
  email_enabled BOOLEAN,
  in_app_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT
);
```

### Deduplication
- 7-day window for same nudge type + same target (space/connection)
- Query checks existing pending nudges before creation

### User Preferences
- Category filtering (4 categories)
- Frequency control (never/low/normal/high)
- Quiet hours support
- Email toggle
- In-app toggle

### Learning from Interactions
- ❌ **Not implemented** - DIA does not currently learn from nudge interactions
- Nudge status (accepted/dismissed) is stored but not analyzed

---

## 8. Naming Audit: "Assistant" vs "Agent"

### Instances Found Requiring Update

| File | Line | Current Text | Required Change |
|------|------|--------------|-----------------|
| `src/config/dia-pillar-config.ts` | 108 | `'Your AI assistant for Africa and its global diaspora'` | Change to `'Your AI agent for Africa and its global diaspora'` |
| `src/pages/dna/DiaPage.tsx` | 42 | `'Your AI assistant for Africa and its global diaspora...'` | Change to `'Your AI agent for Africa and its global diaspora...'` |

### Verified Correct Usage

| File | Line | Text | Status |
|------|------|------|--------|
| `src/components/dia/DiaPanel.tsx` | 35 | `'Diaspora Intelligence Agent'` | ✅ Correct |
| `src/config/dia-pillar-config.ts` | 124 | `'Diaspora Intelligence Agent'` | ✅ Correct |
| `supabase/functions/dia-search/index.ts` | 121 | `'You are DIA, the Diaspora Intelligence Agent'` | ✅ Correct |

### Non-DIA "Assistant" References (Ignore)
- `src/components/linkedin/ProfileCard.tsx:55` - Refers to a separate AI writing assistant feature

---

## 9. TypeScript Quality in DIA Code

### `any` Type Usage

| File | Line | Context | Severity |
|------|------|---------|----------|
| `src/components/dia/NudgeCard.tsx` | 26 | `[key: string]: any` in interface | Medium - Loose payload type |
| `src/components/dia/NudgeCard.tsx` | 29 | `[key: string]: any` in interface | Medium - Loose config type |
| `src/components/dia/DiaInsightOfDay.tsx` | 31 | `.from('dia_insights' as any)` | Low - Table name escape |
| `src/components/dia/DiaInsightOfDay.tsx` | 35 | `as any` on query result | Low - Supabase typing |
| `src/components/dia/DiaHistory.tsx` | 44 | `.from('dia_query_log' as any)` | Low - Table name escape |
| `src/components/dia/DiaHistory.tsx` | 48 | `as any` on query result | Low - Supabase typing |
| `src/components/dia/DiaInsights.tsx` | 81 | `.from('dia_insights' as any)` | Low - Table name escape |
| `src/components/dia/DiaInsights.tsx` | 85 | `as any` on query result | Low - Supabase typing |
| `src/components/dia/DiaInsights.tsx` | 106 | `.from('dia_insights' as any)` | Low - Table name escape |
| `src/components/dia/DiaInsights.tsx` | 108 | `as any` on query result | Low - Supabase typing |
| `src/components/dia/DiaSearch.tsx` | 316 | `onError: (error: any)` | Low - Error handler |
| `src/hooks/useDiaPreferences.ts` | 79 | `.update(preferences as any)` | Medium - Type bypass |
| `src/hooks/useDiaNudges.ts` | 13 | `payload: any` | Medium - Loose payload |
| `src/hooks/useDiaNudges.ts` | 56 | `(nudge: any)` in map | Low - Type inference |
| `supabase/functions/dia-search/index.ts` | 157 | `supabase: any` | Medium - Service type |

### Summary
- **Total `any` usages:** 15
- **High severity:** 0
- **Medium severity:** 4 (should be typed properly)
- **Low severity:** 11 (acceptable workarounds)

### Recommendations
1. Create proper TypeScript types for `dia_insights`, `dia_query_log` tables
2. Define strict `NudgePayload` interface instead of `any`
3. Add Supabase generated types for DIA tables to `src/integrations/supabase/types.ts`

---

## 10. Gap Analysis Summary

| Future Capability | Current Foundation | Gap Assessment | Effort Estimate |
|------------------|-------------------|----------------|-----------------|
| **Pulse Bar intelligence (ranking, scoring)** | No scoring system exists | Need: user engagement scoring engine, activity weight system, real-time score updates | Large - New subsystem required |
| **Cross-module synthesis** | Pillar config provides context hints | Need: unified data aggregation, cross-pillar pattern detection, synthesis engine | Large - Architectural change |
| **Behavior pattern tracking** | Query logging exists (analytics only) | Need: user activity tracking, pattern recognition, behavioral models | Medium - Add tracking layer |
| **Proactive nudge triggers** | Scheduled functions only | Need: event bus, real-time triggers, condition evaluation engine | Medium - Event infrastructure |
| **User-defined automation rules** | No rules engine | Need: rule definition UI, condition parser, action executor | Large - New feature |
| **External AI integrations** | Perplexity + OpenAI working | Need: abstraction layer for multiple providers, fallback logic | Small - Refactor existing |
| **Personalized recommendations** | Platform-wide matching only | Need: user profile analysis, preference learning, connection graph access | Medium - Data access expansion |
| **Learning from interactions** | Nudge status stored | Need: feedback analysis, preference inference, model updates | Medium - ML component |

---

## Top 10 Critical Files

| Rank | File | Importance | Reason |
|------|------|------------|--------|
| 1 | `supabase/functions/dia-search/index.ts` | Critical | Core intelligence engine |
| 2 | `src/components/dia/DiaSearch.tsx` | Critical | Primary user interface |
| 3 | `src/hooks/useDiaNudges.ts` | High | Nudge state management |
| 4 | `src/config/dia-pillar-config.ts` | High | Pillar-specific behavior |
| 5 | `src/services/spaceHealthService.ts` | High | Space health intelligence |
| 6 | `supabase/functions/generate-opportunity-nudges/index.ts` | High | Opportunity matching |
| 7 | `src/components/dia/NudgeCard.tsx` | High | Nudge presentation |
| 8 | `supabase/migrations/20251228100001_adin_perplexity_integration.sql` | High | Core schema |
| 9 | `src/pages/admin/DiaAdminPage.tsx` | Medium | Monitoring & analytics |
| 10 | `src/services/opportunityMatchingService.ts` | Medium | Contribution matching |

---

## Recommended Priority Fixes for Alpha

### P0 (Critical - Before Alpha)

1. **Fix "Assistant" → "Agent" naming** (2 locations)
   - `src/config/dia-pillar-config.ts:108`
   - `src/pages/dna/DiaPage.tsx:42`

2. **Add Supabase types for DIA tables**
   - Add `dia_insights`, `dia_query_log` to generated types
   - Eliminates `as any` workarounds

### P1 (High - Alpha Quality)

3. **Type the nudge payload interface**
   - Replace `payload: any` with proper `NudgePayload` type
   - Define action_url, priority, match_reasons structure

4. **Add error boundary to DIA components**
   - Graceful degradation if Perplexity fails
   - User-friendly error states

5. **Verify rate limit reset logic**
   - Confirm monthly reset works correctly
   - Add user-facing reset date display

### P2 (Medium - Polish)

6. **Add loading states to NudgeCard**
   - Show loading when accepting/dismissing
   - Prevent double-clicks

7. **Improve cache hit messaging**
   - Make "Retrieved from cache" less prominent
   - Consider removing or making it admin-only

8. **Add query character count feedback**
   - Show remaining characters (500 limit)
   - Prevent submission of oversized queries

---

## Foundation Requirements for DIA Phase 1 (Pulse Bar Intelligence)

### Required New Infrastructure

1. **User Activity Tracking Table**
```sql
CREATE TABLE user_activity_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  event_type TEXT,  -- 'login', 'search', 'connect', 'contribute', etc.
  event_data JSONB,
  created_at TIMESTAMPTZ
);
```

2. **Engagement Score Table**
```sql
CREATE TABLE user_engagement_scores (
  user_id UUID PRIMARY KEY,
  overall_score DECIMAL(5,2),  -- 0-100
  connect_score DECIMAL(5,2),
  convene_score DECIMAL(5,2),
  collaborate_score DECIMAL(5,2),
  contribute_score DECIMAL(5,2),
  convey_score DECIMAL(5,2),
  last_calculated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

3. **Scoring Edge Function**
```
supabase/functions/calculate-engagement-scores/index.ts
- Run nightly or on-demand
- Weight different activities
- Store in engagement_scores table
```

4. **Pulse Bar API Endpoint**
```
supabase/functions/pulse-bar-intelligence/index.ts
- Fetch current scores
- Return ranked items per pillar
- Consider user context
```

### Required Changes to Existing Code

1. **Add activity logging to key actions**
   - Connection requests
   - Event RSVPs
   - Space joins
   - Contributions made
   - Stories published

2. **Extend DiaSearch for personalization**
   - Accept user profile context
   - Weight results by user interests
   - Consider connection graph

3. **Add real-time score updates**
   - Supabase trigger on activity events
   - Incremental score updates
   - Realtime subscription for Pulse Bar

### Estimated Effort
- Database schema: 1 day
- Edge functions: 2-3 days
- Activity logging integration: 2 days
- Pulse Bar component: 2 days
- Testing & refinement: 2 days
- **Total: ~10 days**

---

## Orphaned/Deprecated Code

No orphaned or abandoned DIA code was found. All discovered files are actively used:

- All components are imported and rendered
- All hooks are consumed by components
- All edge functions are configured in `supabase/config.toml`
- Database tables have active RLS policies

### Legacy Naming Note
The "ADIN" prefix on database tables (`adin_nudges`, `adin_preferences`, etc.) is legacy naming from "African Diaspora Intelligence Network". The UI displays "DIA" consistently. Consider a future migration to rename tables to `dia_*` for consistency, but this is non-blocking.

---

## Security Audit Summary

| Check | Status | Notes |
|-------|--------|-------|
| API keys in code | ✅ Pass | All keys in environment variables |
| Exposed secrets | ✅ Pass | No secrets in client-side code |
| RLS policies | ✅ Pass | Proper policies on all DIA tables |
| SQL injection | ✅ Pass | Parameterized queries used |
| XSS prevention | ✅ Pass | React escaping, no dangerouslySetInnerHTML |
| Auth checks | ✅ Pass | Token validation in edge functions |
| Rate limiting | ✅ Pass | Database-enforced limits |
| Admin access | ✅ Pass | Role-based access control |

---

*This audit provides a comprehensive snapshot of DIA's current state and serves as the foundation for the DIA Phase 1 PRD.*

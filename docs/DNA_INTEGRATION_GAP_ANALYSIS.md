# DNA Five C's Integration Gap Analysis

## Executive Summary

This audit evaluates the integration points between DNA's Five C's (Connect, Convene, Collaborate, Contribute, Convey) to verify the cyclical value circulation system is functioning as intended.

**Overall Integration Maturity: ~45%**

The platform has foundational integration architecture but lacks many critical handoff points for true cyclical flow.

---

## Integration Cycle Overview

```
CONNECT → CONVENE → COLLABORATE → CONTRIBUTE → CONVEY → CONNECT (cycle)
```

---

## 1. CONNECT → CONVENE Integration

### Expected Flow
Users discover events from their connections, receive event invitations, and see which connections are attending events.

### Current Status: **~50% Complete**

| Integration Point | Expected Flow | Current Status | Gap/Action Needed |
|-------------------|---------------|----------------|-------------------|
| Event discovery from connections | Events surfaced based on who you're connected to | ✅ IMPLEMENTED | EventRecommendationsWidget.tsx:52-64 scores events by connections attending |
| "Connections attending" indicator | Show which connections are at an event | ✅ IMPLEMENTED | EventSocialProof.tsx displays connection avatars |
| Event invitations to connections | Send event invites to specific connections | ❌ MISSING | No invitation system exists |
| Post-connect event suggestions | After connecting, see their events | ❌ MISSING | No trigger after connection acceptance |
| Connection-filtered event view | "My Network's Events" filter | ❌ MISSING | No filter in ConveneHub |
| Event sharing to connections | Share event via DM to connections | ❌ MISSING | Only URL copy exists |

### Priority Actions

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **HIGH** | Add event invitation system with connection selector | `EventDetail.tsx`, new `InviteConnectionsDialog.tsx` |
| **HIGH** | Add "My Network's Events" filter to Convene | `ConveneHub.tsx`, `ConnectEventsTab.tsx` |
| **MEDIUM** | Post-connection event suggestion modal | `ConnectionRequestCard.tsx:50` |
| **MEDIUM** | Highlight connections in attendee lists | `EventDetail.tsx:424-447` |
| **LOW** | Add cache invalidation on new connection | `EventRecommendationsWidget.tsx:260` |

---

## 2. CONVENE → COLLABORATE Integration

### Expected Flow
Events can spawn collaboration spaces, attendees can be invited to related spaces, and post-event flows suggest continued collaboration.

### Current Status: **~50% Complete**

| Integration Point | Expected Flow | Current Status | Gap/Action Needed |
|-------------------|---------------|----------------|-------------------|
| Create space from event | "Continue this conversation" CTA | ✅ IMPLEMENTED | CreateSpace.tsx:45-89 accepts `from_event_id` param |
| Event-space database link | Spaces reference origin events | ✅ IMPLEMENTED | `origin_event_id` foreign key exists |
| Spaces shown on event page | Related spaces visible to attendees | ✅ IMPLEMENTED | EventSpacesSection.tsx renders on EventDetail |
| Back-reference to origin event | Space shows source event | ✅ IMPLEMENTED | SpaceDetail.tsx:238-248 "Origin Event" section |
| "From Event" badge on spaces | Visual indicator in discovery | ✅ IMPLEMENTED | SuggestedSpaces.tsx:167-182 |
| Bulk invite event attendees | Invite all attendees to space | ❌ MISSING | No bulk invitation feature |
| Attendee CTA to join space | Non-organizers see space CTA | ❌ MISSING | Only organizers see "Create Space" |
| Post-event follow-up prompts | Notification after event ends | ❌ MISSING | No event completion trigger |
| Event→Space templates | Space templates by event type | ❌ MISSING | Generic creation only |

### Priority Actions

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **HIGH** | Add "Join Space" CTA on EventDetail for attendees | `EventDetail.tsx:488-491` |
| **HIGH** | Bulk invite attendees feature in SpaceSettings | `SpaceMembers.tsx`, new `InviteAttendeesDialog.tsx` |
| **MEDIUM** | Post-event notification to create/join space | `supabase/functions/` new edge function |
| **MEDIUM** | Complete analytics dashboard for conversion | `OrganizerAnalyticsDashboard.tsx:87-93` |
| **LOW** | Event-type-specific space templates | `CreateSpace.tsx` |

---

## 3. COLLABORATE → CONTRIBUTE Integration

### Expected Flow
Spaces can post contribution needs, space members see relevant opportunities, and contributions link directly to spaces.

### Current Status: **~70% Complete**

| Integration Point | Expected Flow | Current Status | Gap/Action Needed |
|-------------------|---------------|----------------|-------------------|
| Space creates needs | Space leads post "This project needs..." | ✅ IMPLEMENTED | SpaceNeedsSection.tsx:117-121, NeedFormDialog.tsx |
| Need-space relationship | Database foreign key | ✅ IMPLEMENTED | `contribution_needs.space_id` exists |
| Needs visible in space | Space members see opportunities | ✅ IMPLEMENTED | SpaceDetail.tsx:338 "Contribute" tab |
| Contributions tied to spaces | Offers reference space_id | ✅ IMPLEMENTED | useContributionMutations.ts:110-165 |
| Navigate space→needs | Link from space to opportunities | ✅ IMPLEMENTED | SpaceNeedsSection links to NeedDetail |
| Navigate needs→space | "View Space" on opportunity | ✅ IMPLEMENTED | NeedDetail.tsx:193-227 "Associated Project" |
| Space lead validates contributions | Manage offer status | ✅ IMPLEMENTED | NeedOffersSection.tsx:56-58 |
| Member-specific recommendations | Filter opportunities by membership | ❌ MISSING | No JOIN on space_members in queries |
| Space cards show opportunities | "X open needs" badge | ❌ MISSING | No indicator on space cards |
| Join space → contribute flow | Post-join CTA to help | ❌ MISSING | No onboarding prompt |
| Space lead dashboard | Aggregated contribution stats | ❌ MISSING | No cross-need analytics |

### Priority Actions

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **HIGH** | Add "Opportunities in My Spaces" recommendations | `NeedsIndex.tsx`, new RPC query |
| **MEDIUM** | Show open needs count on space cards | `SpaceCard.tsx` |
| **MEDIUM** | Post-join "See how you can help" prompt | `SpaceDetail.tsx` |
| **LOW** | Space lead contribution dashboard | New `SpaceContributionsDashboard.tsx` |

---

## 4. CONTRIBUTE → CONVEY Integration

### Expected Flow
Completed contributions generate impact stories, success stories from contributions are surfaced, and opportunity sharing exists.

### Current Status: **~60% Complete**

| Integration Point | Expected Flow | Current Status | Gap/Action Needed |
|-------------------|---------------|----------------|-------------------|
| Contribution → Story CTA | "Share your impact" after validation | ✅ IMPLEMENTED | ImpactStoryCTA.tsx:24-26 navigates to CreateStory |
| Impact story prefill | Auto-populate story from contribution | ✅ IMPLEMENTED | useImpactSummary.ts:95-150 generates template |
| Story type for impact | Dedicated 'impact' story type | ✅ IMPLEMENTED | conveyTypes.ts:1, storyTypes.ts:27-40 |
| Store contribution link | Story references source need | ✅ IMPLEMENTED | primary_need_id, primary_offer_id in schema |
| Prevent duplicate drafts | Check existing impact drafts | ✅ IMPLEMENTED | useCheckExistingImpactDraft() hook |
| Display linked need on story | Show source contribution | ❌ MISSING | primary_need NOT displayed in StoryDetail.tsx |
| Filter stories by contribution | "Stories from contributions" view | ❌ MISSING | No query in useConveyFeed.ts |
| Share opportunity as content | Share button on NeedDetail | ❌ MISSING | No share functionality on opportunities |
| Populate all primary IDs | Store offer_id, badge_id | ❌ MISSING | Fields exist but never populated |

### Priority Actions

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **HIGH** | Add share button to NeedDetail/OpportunityDetail | `NeedDetail.tsx`, `OpportunityDetail.tsx` |
| **HIGH** | Display primary_need in StoryDetail sidebar | `StoryDetail.tsx:292-317` |
| **MEDIUM** | Add "Contribution Stories" filter to ConveyHub | `ConveyFeedFilters.tsx`, `useConveyFeed.ts` |
| **LOW** | Populate primary_offer_id and primary_badge_id | `useConveyMutations.ts` |

---

## 5. CONVEY → CONNECT Integration

### Expected Flow
Content engagement leads to connection suggestions, author profiles are discoverable, and shared interests inform recommendations.

### Current Status: **~15% Complete**

| Integration Point | Expected Flow | Current Status | Gap/Action Needed |
|-------------------|---------------|----------------|-------------------|
| Story engagement tracking | Track views, reactions, bookmarks | ✅ IMPLEMENTED | useStoryEngagement.ts:248-278 |
| Author data in stories | Load author profile info | ✅ IMPLEMENTED | useConveyFeed.ts:27-31 includes profiles |
| Profile interests in matching | Match on interest_tags | ✅ IMPLEMENTED | matchingService.ts:183-191 |
| "Connect with author" CTA | Button on story pages | ❌ MISSING | No ConnectButton on stories |
| Author → profile navigation | Click author name to view profile | ❌ MISSING | Author displayed as static text |
| Content → interests mapping | Story engagement informs matching | ❌ MISSING | No engagement→interests pipeline |
| Content-based recommendations | "People interested in X" | ❌ MISSING | matchingService doesn't use content data |

### Priority Actions

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **HIGH** | Make author names clickable to profile | `StoryDetail.tsx:214-233`, `ConveyStoryCard.tsx:235-241` |
| **HIGH** | Add "Connect with Author" button on stories | `StoryDetail.tsx` sidebar |
| **MEDIUM** | Track story focus_areas as user interests | New tracking table/function |
| **LOW** | Extend rpc_adin_recommend_people for content | `matchingService.ts`, new RPC |

---

## 6. Cross-Module Integration

### Expected Flow
Feed shows all Five C's, profile displays engagement across all modules, DIA recommends across all C's, and search covers everything.

### Current Status: **~55% Complete**

### Feed Coverage

| Content Type | In Feed | Card Component | Status |
|--------------|---------|----------------|--------|
| Posts (Connect) | ✅ | FeedConnectionCard.tsx | Complete |
| Events (Convene) | ✅ | FeedEventCard.tsx | Complete |
| Spaces (Collaborate) | ✅ | FeedSpaceCard.tsx | Complete |
| Contributions (Contribute) | ✅ | FeedContributionCard.tsx | Complete |
| Stories (Convey) | ✅ | FeedStoryCard.tsx | Complete |
| Opportunities | ❌ | None | **MISSING** |

### Profile Coverage (ProfileV2.tsx)

| Content Type | Displayed | Component | Status |
|--------------|-----------|-----------|--------|
| Connections (Connect) | ✅ | ProfileV2Connection | Complete |
| Events (Convene) | ✅ | ProfileV2Events | Complete |
| Spaces (Collaborate) | ✅ | ProfileV2Spaces | Complete |
| Contributions (Contribute) | ✅ | ProfileV2Contributions | Complete |
| Opportunities | ✅ | ProfileV2Opportunities | Complete |
| Stories (Convey) | ❌ | ProfileStoriesSection.tsx EXISTS but NOT RENDERED | **CRITICAL GAP** |

### DIA Recommendations

| Content Type | Has Recommendations | Edge Function | Status |
|--------------|---------------------|---------------|--------|
| Connections | ✅ | generate-connect-nudges | Complete |
| Events | ✅ | get-event-recommendations | Complete |
| Spaces | ❌ | None | **MISSING** |
| Contributions | ❌ | None | **MISSING** |
| Stories | ❌ | None | **MISSING** |

### Search Coverage

| Content Type | DIA Search | AI Search | Global Search |
|--------------|------------|-----------|---------------|
| Profiles | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ |
| Posts | ❌ | ✅ | ✅ |
| Spaces | ⚠️ Partial | ❌ | ❌ |
| Contributions | ❌ | ❌ | ❌ |
| Stories | ❌ | ❌ | ❌ |
| Opportunities | ❌ | ❌ | ⚠️ Partial |

### Priority Actions

| Priority | Action | Files to Modify |
|----------|--------|-----------------|
| **CRITICAL** | Add ProfileStoriesSection to ProfileV2 | `ProfileV2.tsx` (component exists, just not imported) |
| **HIGH** | Add spaces to search functions | `ai-search/index.ts`, `global-search/index.ts` |
| **HIGH** | Add contributions to search | All search edge functions |
| **HIGH** | Add stories to search | All search edge functions |
| **MEDIUM** | Create space recommendation function | New `get-space-recommendations` edge function |
| **MEDIUM** | Create contribution recommendation function | New `get-contribution-recommendations` edge function |
| **LOW** | Add OpportunityCard to feed | `activity-cards/`, `feed.ts` types |

---

## Summary: Integration Health by Connection

| Integration | Maturity | Critical Gaps |
|-------------|----------|---------------|
| CONNECT → CONVENE | 50% | No event invitations, no post-connect suggestions |
| CONVENE → COLLABORATE | 50% | No bulk attendee invites, no attendee CTAs |
| COLLABORATE → CONTRIBUTE | 70% | No member-specific recommendations |
| CONTRIBUTE → CONVEY | 60% | No opportunity sharing, missing story link display |
| CONVEY → CONNECT | 15% | **No author navigation, no content-based matching** |
| Cross-Module | 55% | **Stories missing from profile**, incomplete search |

---

## Top 10 Priority Actions

| # | Action | Impact | Effort | Files |
|---|--------|--------|--------|-------|
| 1 | **Add ProfileStoriesSection to ProfileV2** | Critical | Low | `ProfileV2.tsx` |
| 2 | **Make story authors clickable + Connect CTA** | High | Low | `StoryDetail.tsx`, `ConveyStoryCard.tsx` |
| 3 | **Add event invitation system** | High | Medium | `EventDetail.tsx`, new dialog |
| 4 | **Bulk invite event attendees to spaces** | High | Medium | `SpaceMembers.tsx`, new dialog |
| 5 | **Add share button to opportunities** | High | Low | `NeedDetail.tsx` |
| 6 | **Add "Join Space" CTA for event attendees** | High | Low | `EventDetail.tsx` |
| 7 | **Add contributions/stories to search** | High | Medium | All search edge functions |
| 8 | **Add "My Network's Events" filter** | Medium | Low | `ConveneHub.tsx` |
| 9 | **Add member-specific opportunity recs** | Medium | Medium | New RPC query |
| 10 | **Display primary_need on StoryDetail** | Medium | Low | `StoryDetail.tsx` |

---

## Architectural Recommendations

### 1. Unified Cross-Pillar Actions System
The `crossActions.ts` config provides a good foundation but needs expansion:
- Add actions for all missing integrations
- Create consistent CTA patterns across all modules

### 2. Content Engagement Pipeline
Build a system to:
- Track content consumption patterns
- Infer interests from engagement
- Feed interests into matching/recommendation systems

### 3. Universal Notification System
Create post-action triggers for:
- Post-connect: Show connection's events
- Post-event: Suggest creating/joining space
- Post-join-space: Show contribution opportunities
- Post-contribution: Prompt impact story

### 4. Search Unification
Consolidate search functions to query:
- All Five C's content types
- Consistent ranking/scoring
- Unified result format

---

## Appendix: Key File References

### Integration Components
- `src/config/crossActions.ts` - Cross-pillar navigation config
- `src/components/feed/activity-cards/` - All feed cards
- `src/components/profile/cross-5c/` - Profile section components

### Edge Functions
- `supabase/functions/get-event-recommendations/` - Event recommendations
- `supabase/functions/generate-connect-nudges/` - Connection nudges
- `supabase/functions/ai-search/` - AI-powered search
- `supabase/functions/global-search/` - Global search
- `supabase/functions/dia-search/` - DIA search

### Key Pages
- `src/pages/ProfileV2.tsx` - Profile display
- `src/pages/dna/convene/EventDetail.tsx` - Event details
- `src/pages/dna/collaborate/SpaceDetail.tsx` - Space details
- `src/pages/dna/contribute/NeedDetail.tsx` - Need details
- `src/pages/dna/convey/StoryDetail.tsx` - Story details

### Services
- `src/services/matchingService.ts` - Connection matching
- `src/services/connectionService.ts` - Connection management

---

*Generated: 2025-12-31*
*Audit conducted on branch: claude/audit-dna-integration-HCrmL*

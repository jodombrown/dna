# DNA | CONNECT – Comprehensive Feature Assessment & Map
**Date:** December 18, 2024  
**Module:** CONNECT (1 of 5 Cs)  
**Status:** Beta Active

---

## 1. Overview

DNA | CONNECT is the **network layer** of the Diaspora Network of Africa platform. It enables members to:
- **Discover** other diaspora members via smart matching algorithms
- **Connect** through a request/accept workflow
- **Message** directly through a WhatsApp-inspired inbox
- **View profiles** with cross-5C activity integration

CONNECT serves as the **trust infrastructure** for the other 4 Cs (CONVENE, COLLABORATE, CONTRIBUTE, CONVEY). The connection graph created here powers recommendations, visibility, and engagement across the entire platform. It operates both as a standalone discovery and networking tool and as the relational backbone connecting all pillars.

---

## 2. Feature-by-Feature Breakdown

### 2.1 Member Discovery & Smart Matching

**Purpose:**  
Allow users to find and evaluate potential connections based on shared attributes, complementary goals, and diaspora-specific criteria.

**User Actions:**
- Search members by name, location, focus area, industry
- Filter by skills, mentor/investor status, diaspora status
- View match scores (0-100%) with reasoning popover
- See mutual connections count
- Paginate through discovery results (Load More)

**Routes:**
| Route | Type | Description |
|-------|------|-------------|
| `/dna/connect/discover` | Primary | Main discovery interface |
| `/dna/connect` | Hub | Redirects to discover |
| `/dna/discover/members` | Legacy | Redirects to discover |

**Components & Hooks:**
| File | Purpose |
|------|---------|
| `src/pages/dna/connect/Discover.tsx` | Discovery page with filters and member grid |
| `src/components/connect/MemberCard.tsx` | Member card with match score, actions |
| `src/components/discover/MatchScoreBadge.tsx` | Visual match score with reasoning popover |
| `src/components/discover/DiscoveryCard.tsx` | Alternative discovery card layout |
| `src/components/discover/DiscoveryFilters.tsx` | Filter UI component |
| `src/hooks/useConnectionStatus.ts` | Get connection state with another user |
| `src/hooks/useMutualConnections.ts` | Fetch mutual connections between users |

**Backend (RPCs/Tables):**
| Name | Type | Description |
|------|------|-------------|
| `discover_members` | RPC | Main discovery with 14+ matching criteria |
| `get_suggested_connections` | RPC | AI-suggested connections for user |
| `get_mutual_connections` | RPC | Find shared connections between two users |
| `profiles` | Table | User profile data for matching |

**Matching Algorithm (`matchingService.ts`):**
- **14+ matching criteria** weighted across categories:
  - Core (60%): Skills, location, profession, culture, interests, collaboration
  - Diaspora-specific (25%): Languages, diaspora status, regional expertise, African causes
  - Professional depth (15%): Mentorship, industry, impact areas, experience
- **Bonus scoring** for complementary pairs (hiring↔job seeking, investing↔seeking investment, mentoring↔being mentored)
- **African region awareness**: Groups countries by West/East/Southern/North/Central Africa

---

### 2.2 Connection Request System

**Purpose:**  
Enable formal relationship establishment between members with optional personalized messages.

**User Actions:**
- Send connection request (with optional message)
- Accept incoming request → becomes connection
- Decline incoming request
- Withdraw sent request
- View pending incoming requests
- View sent requests awaiting response

**States:**
```
none → pending_sent → accepted
                  ↘ declined
none ← pending_received (from other user)
```

**Routes:**
| Route | Type | Description |
|-------|------|-------------|
| `/dna/connect/network` | Primary | Network management with tabs |
| `/network` | Legacy | Standalone network page |

**Components & Hooks:**
| File | Purpose |
|------|---------|
| `src/pages/dna/connect/Network.tsx` | Network page with 4 tabs (Requests/Sent/Connections/Suggestions) |
| `src/pages/Network.tsx` | Standalone network page (3 tabs) |
| `src/components/network/ConnectionRequestCard.tsx` | Incoming request card with accept/decline |
| `src/components/network/SentRequestCard.tsx` | Outgoing request card with withdraw |
| `src/components/network/ConnectionCard.tsx` | Active connection card |
| `src/components/connect/ConnectButton.tsx` | Smart button adapting to connection state |
| `src/components/connect/ConnectionRequestModal.tsx` | Modal for composing request message |
| `src/services/connectionService.ts` | All connection CRUD operations |

**Backend:**
| Name | Type | Description |
|------|------|-------------|
| `connections` | Table | Stores connection relationships |
| `send-connection-request` | Edge Function | Validates & creates connection request |
| `get_connection_requests` | RPC | Get pending requests for user |
| `get_connection_status` | RPC | Check relationship between two users |
| `get_user_connections` | RPC | Get user's active connections |

**Safety Features in Edge Function:**
- Rate limiting: 20 requests per hour
- Block check: Prevents requests between blocked users
- Duplicate check: Prevents multiple pending requests
- Email notification to recipient

---

### 2.3 Direct Messaging

**Purpose:**  
Enable private 1:1 conversations between any members (WhatsApp-inspired UX).

**User Actions:**
- Start conversation from profile/card
- Send text messages with link previews
- Send images and files
- Send voice messages (transcription available)
- Add emoji reactions to messages
- Search messages across conversations
- Pin/Mute/Archive conversations
- Mark as read
- Report messages
- Block user from conversation

**Routes:**
| Route | Type | Description |
|-------|------|-------------|
| `/dna/messages` | Primary | Inbox with conversation list + thread |
| `/dna/messages/:conversationId` | Primary | Open specific conversation |
| `/dna/connect/messages` | Legacy | Redirects to canonical route |

**Components & Hooks:**
| File | Purpose |
|------|---------|
| `src/pages/dna/Messages.tsx` | Main messages page (two-column layout) |
| `src/components/messaging/ConversationListPanel.tsx` | Left panel: conversation list |
| `src/components/messaging/ConversationThread.tsx` | Right panel: chat thread |
| `src/components/messaging/MessageBubble.tsx` | Individual message display |
| `src/components/messaging/MessageComposer.tsx` | Text input with attachments |
| `src/components/messaging/AdvancedMessageComposer.tsx` | Full composer with voice/emoji |
| `src/components/messaging/InboxTabs.tsx` | Primary/Archive tabs |
| `src/contexts/MessageContext.tsx` | Global message overlay control |
| `src/hooks/useRealtimeMessages.ts` | Realtime message subscription |
| `src/hooks/useUnreadMessageCount.ts` | Badge count for navigation |
| `src/services/messageService.ts` | Full messaging API (~1100 lines) |

**Backend:**
| Name | Type | Description |
|------|------|-------------|
| `conversations` | Table | user_a, user_b with mute/pin/archive flags |
| `messages` | Table | content, sender_id, read status, payload |
| `message_reactions` | Table | Emoji reactions on messages |
| `get_user_conversations` | RPC | List conversations with unread counts |

**Message Service Capabilities:**
- CRUD: getOrCreateConversation, sendMessage, deleteMessage
- Read status: markAsRead, getTotalUnreadCount
- Search: searchMessages with conversation filter
- Reactions: add/remove emoji reactions
- Voice: Upload with transcription via edge function
- Safety: canMessage check (blocked users)
- Realtime: subscribeToMessages for live updates

---

### 2.4 Profile Viewing

**Purpose:**  
Display member profiles with cross-5C activity and enable connection/messaging actions.

**User Actions:**
- View any member's public profile
- See diaspora connection info (heritage, languages, regional expertise)
- View cross-5C activity (Spaces, Events, Contributions, Stories)
- See mutual connections
- Connect/Message from profile
- Block/Report user
- Share profile (Copy link, WhatsApp, LinkedIn, Twitter, PDF)

**Routes:**
| Route | Type | Description |
|-------|------|-------------|
| `/dna/:username` | Primary | Authenticated profile view |
| `/u/:username` | Public | Unauthenticated shareable profile |

**Components:**
| File | Purpose |
|------|---------|
| `src/pages/dna/PublicProfile.tsx` | Main profile page (authenticated) |
| `src/pages/PublicProfilePage.tsx` | Public shareable profile |
| `src/pages/ProfileV2.tsx` | Enhanced profile renderer |
| `src/components/profile/cross-5c/` | Cross-5C activity sections |
| `src/components/profile/ProfileShareDropdown.tsx` | Share menu with multiple options |
| `src/components/safety/BlockUserDialog.tsx` | Block confirmation dialog |
| `src/components/safety/ReportDialog.tsx` | Report user dialog |

**Cross-5C Profile Sections:**
- `ProfileSpacesSection`: COLLABORATE spaces user belongs to
- `ProfileEventsSection`: CONVENE events user is attending
- `ProfileContributionsSection`: CONTRIBUTE offers/needs
- `ProfileStoriesSection`: CONVEY stories authored by user

---

### 2.5 User Safety & Blocking

**Purpose:**  
Protect users from harassment and enable relationship management.

**User Actions:**
- Block a user (removes connection, prevents messaging/discovery)
- Unblock a user
- Report a user/message/content
- View blocked users list

**Components & Services:**
| File | Purpose |
|------|---------|
| `src/components/safety/BlockUserDialog.tsx` | Confirm block with reason |
| `src/components/safety/ReportDialog.tsx` | Report content/user |
| `src/services/connectionService.ts` | blockUser, unblockUser, getBlockedUsers |

**Backend:**
| Name | Type | Description |
|------|------|-------------|
| `blocked_users` | Table | blocker_id, blocked_id, reason |
| `block_user` | RPC | Create block + remove connection |
| `unblock_user` | RPC | Remove block |
| `is_user_blocked` | RPC | Check block status (either direction) |
| `get_blocked_users` | RPC | List user's blocks |

**Safety Enforcement Points:**
- Discovery: Blocked users excluded from results
- Connection requests: Edge function checks block status
- Messaging: canMessage checks block status
- Feed: Blocked users' content filtered

---

### 2.6 ADIN Intelligence Layer (Connect-specific)

**Purpose:**  
Provide intelligent nudges and recommendations to increase engagement and connection quality.

**Features:**
- First connection nudges (new users, 0 connections, 3+ days old)
- Re-engagement nudges (inactive 7+ days)
- Suggested connections based on match score

**Components & Hooks:**
| File | Purpose |
|------|---------|
| `src/hooks/useAdinNudges.ts` | Fetch and manage nudges |
| `src/components/connect/ConnectNudges.tsx` | Display nudges in Connect UI |
| `src/components/network/SuggestionsTab.tsx` | Suggestions based on ADIN |

**Backend:**
| Name | Type | Description |
|------|------|-------------|
| `adin_nudges` | Table | Nudge records with status |
| `adin_recommendations` | Table | ML-style recommendations |
| `generate-connect-nudges` | Edge Function | Scheduled nudge generation |
| `get_users_needing_connection_nudges` | RPC | Find new users without connections |
| `get_inactive_users_for_reengagement` | RPC | Find dormant users |

**Nudge States:** `sent` → `accepted` | `dismissed` | `snoozed`

---

## 3. Data Model & Safety Summary

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles | id, username, full_name, avatar_url, skills, focus_areas, industries, diaspora_status, regional_expertise, languages |
| `connections` | Connection relationships | requester_id, recipient_id, status (pending/accepted/declined), message |
| `conversations` | 1:1 chat threads | user_a, user_b, is_archived_by_*, is_muted_by_*, is_pinned_by_* |
| `messages` | Chat messages | conversation_id, sender_id, content, read, payload |
| `blocked_users` | Block relationships | blocker_id, blocked_id, reason |
| `adin_nudges` | Engagement nudges | user_id, nudge_type, message, status |

### RLS Policies (Key)

- **connections**: Users can view own connections; recipients can update status
- **messages**: Users can CRUD own messages; participants can view conversation
- **blocked_users**: Users can manage own blocks
- **adin_nudges**: Users can read/update own nudges

### Safety Mechanisms

1. **Profile Gate**: Removed (was 40% completion required) - now zero blocking
2. **Blocking**: Bidirectional check prevents all interaction
3. **Rate Limiting**: 20 connection requests/hour via edge function
4. **RLS**: Row-level security on all user data
5. **Report System**: Content flags table for moderation

---

## 4. Interconnectedness Map

### CONNECT → Other Cs

| From CONNECT | To | Integration Point |
|--------------|-----|-------------------|
| Profile View | COLLABORATE | `ProfileSpacesSection` shows user's spaces |
| Profile View | CONVENE | `ProfileEventsSection` shows user's events |
| Profile View | CONTRIBUTE | `ProfileContributionsSection` shows offers/needs |
| Profile View | CONVEY | `ProfileStoriesSection` shows user's stories |
| Discovery | CONVEY | Feed cards link to story author profiles |
| Connections | All Cs | Connection graph determines visibility/recommendations |

### Shared Infrastructure

| Component | Used By |
|-----------|---------|
| `profiles` table | All Cs (identity) |
| `blocked_users` | All Cs (safety filter) |
| `connectionService` | Connect, Feed, Messaging |
| `messageService` | Connect, Spaces (future), Events (future) |
| ADIN tables | Connect (nudges), Feed (recommendations) |
| `useAuth` hook | All authenticated routes |
| `UnifiedHeader` | All DNA pages |
| `MobileBottomNav` | All DNA mobile pages |

---

## 5. Gaps, Duplications & Legacy Code

### Half-Implemented Features

| Feature | Status | Notes |
|---------|--------|-------|
| Message Requests | Placeholder | `useMessageRequests.ts` returns empty arrays, RPCs not implemented |
| Message Reporting | Placeholder | `reportMessage()` returns 'pending', no actual implementation |
| Voice Transcription | Partial | Edge function exists but integration may be incomplete |
| Group Messaging | Not Started | Tables (`conversations_new`, `conversation_participants`) exist but not used |

### Duplications

| Issue | Files Affected |
|-------|----------------|
| Two Network Pages | `src/pages/Network.tsx` AND `src/pages/dna/connect/Network.tsx` - similar functionality |
| Two MemberCard patterns | `src/components/connect/MemberCard.tsx` vs `src/components/network/ConnectionCard.tsx` |
| ConnectionCard duplication | `src/components/connect/ConnectionCard.tsx` AND `src/components/network/ConnectionCard.tsx` |
| ConnectionRequestCard duplication | `src/components/connect/ConnectionRequestCard.tsx` AND `src/components/network/ConnectionRequestCard.tsx` |

### Legacy Routes (Redirecting)

| Legacy Route | Canonical Route |
|--------------|-----------------|
| `/dna/discover/members` | `/dna/connect/discover` |
| `/dna/discover` | `/dna/connect/discover` |
| `/dna/network` | `/dna/connect/network` |
| `/dna/connect/messages` | `/dna/messages` |
| `/discover` | `/dna/connect/discover` |
| `/discover/members` | `/dna/connect/discover` |

### Potential Dead Code

| File | Issue |
|------|-------|
| `src/pages/Discover.tsx` | May be unused (legacy discovery page) |
| `src/pages/DiscoverMembers.tsx` | May be redundant with `/dna/connect/discover` |
| `src/hooks/useConnectFiltering.ts` | Uses mock data, may be legacy |
| `src/services/embeddingService.ts` | Unknown if used for matching |
| `src/components/connect/tabs/` directory | Legacy tab components |
| `src/components/connect/eventData.ts` | Mock event data, likely unused |

### Schema Artifacts

| Table | Status |
|-------|--------|
| `conversations_new` | Newer schema but appears unused in favor of `conversations` |
| `conversation_participants` | For group messaging, not implemented |
| `messages_new` (if exists) | Check for parallel messaging schemas |

---

## 6. Key Files Reference

### Services
- `src/services/connectionService.ts` - Connection CRUD
- `src/services/messageService.ts` - Messaging API (~1100 lines)
- `src/services/matchingService.ts` - 14+ criteria matching (~812 lines)
- `src/services/profilesService.ts` - Profile operations

### Edge Functions
- `supabase/functions/send-connection-request/` - Request validation & creation
- `supabase/functions/generate-connect-nudges/` - ADIN nudge generation
- `supabase/functions/transcribe-voice/` - Voice message transcription

### Key Hooks
- `useConnectionStatus` - Get status with another user
- `useMutualConnections` - Shared connections
- `useRealtimeMessages` - Live message updates
- `useUnreadMessageCount` - Badge counts
- `useAdinNudges` - ADIN nudge management

---

## 7. Recommendations for Next Steps

1. **Consolidate Network Pages**: Merge `/pages/Network.tsx` with `/pages/dna/connect/Network.tsx`
2. **Deduplicate Components**: Unify ConnectionCard, ConnectionRequestCard, MemberCard variants
3. **Complete Message Requests**: Implement or remove `useMessageRequests` placeholder
4. **Implement Message Reporting**: Complete the reportMessage flow
5. **Clean Legacy Routes**: Remove redirect routes after migration period
6. **Evaluate Group Messaging**: Decide on `conversations_new` schema direction
7. **Audit Matching Service**: Validate 14+ criteria are computing correctly
8. **Add E2E Tests**: Critical paths (discovery → request → accept → message)

---

*This assessment is based on code analysis as of December 18, 2024. No code changes were made.*

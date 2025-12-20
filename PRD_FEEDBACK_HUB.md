# PRD: DNA | Feedback Hub

**Version:** 1.0  
**Owner:** Founder  
**Status:** Ready for Implementation  
**Target:** Claude Code Execution  

---

## 1. Executive Summary

### 1.1 What We're Building
A native, WhatsApp-inspired feedback channel within DNA where all users can submit feedback (text, images, screenshots, voice notes, video clips) in a single, centralized location. This replaces external WhatsApp groups with an owned, scalable, and analytics-rich feedback system.

### 1.2 Why This Matters
- **Ownership:** DNA controls the feedback process, not a third party
- **Scale:** Handle thousands of users providing feedback simultaneously
- **Structure:** Tag, categorize, track, and resolve feedback systematically
- **Insights:** Analytics on feedback trends, user engagement, resolution velocity
- **Context:** Screenshots can be annotated, linked to specific features

### 1.3 Success Metrics
- 80%+ of active users opt-in to feedback channel
- Average time to first response < 24 hours
- Resolution rate > 70% within 7 days
- User satisfaction with feedback process (measured via reactions)

---

## 2. User Stories

### 2.1 End Users (All DNA Members)
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| U1 | As a user, I want to access the feedback hub via a floating button so I can quickly submit feedback from anywhere | FAB visible on all authenticated routes, responsive positioning |
| U2 | As a user, I want to send text messages to report issues or suggestions | Text input with 5000 char limit, markdown support |
| U3 | As a user, I want to upload screenshots/images with my feedback | Multiple image upload, preview before send, max 10MB each |
| U4 | As a user, I want to record voice notes | In-browser audio recording, max 5 minutes, playback preview |
| U5 | As a user, I want to record short video clips | In-browser video recording, max 2 minutes, compression |
| U6 | As a user, I want to tag my feedback type | Tags: #bug, #suggestion, #question, #praise, #other |
| U7 | As a user, I want to see status updates on my feedback | Status badges: Open → In Progress → Resolved |
| U8 | As a user, I want to react to others' feedback | Emoji reactions (👍, ❤️, 🔥, 👀, ✅) |
| U9 | As a user, I want to reply to specific messages | Threaded replies with quoted context |
| U10 | As a user, I want to opt-out of the channel | Toggle in Settings, can rejoin anytime |
| U11 | As a user, I want notifications when my feedback is addressed | In-app toast + email when status changes |

### 2.2 Platform Admin (Founder Only)
| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| A1 | As admin, I want to pin important messages | Pin action, pinned messages show at top |
| A2 | As admin, I want to change feedback status | Dropdown: Open, In Progress, Resolved, Won't Fix |
| A3 | As admin, I want to categorize feedback | Tags: Bug, Feature Request, UX Issue, Question, Duplicate |
| A4 | As admin, I want to highlight priority items | Visual highlight badge, sort by priority |
| A5 | As admin, I want to see analytics dashboard | Counts, trends, resolution rates, top contributors |
| A6 | As admin, I want to delete inappropriate content | Soft delete with audit trail |
| A7 | As admin, I want to respond to feedback | Admin badge on responses |

---

## 3. Information Architecture

### 3.1 Navigation Entry Points

```
┌─────────────────────────────────────────────────────────┐
│  ENTRY POINT 1: Floating Action Button (FAB)            │
│  - Position: Bottom-right, above any existing FABs      │
│  - Visible on all /dna/* routes when authenticated      │
│  - Responsive: moves if overlapping with modals/toasts  │
│  - Icon: MessageSquarePlus or similar                   │
│  - Badge: Shows unread count if admin                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ENTRY POINT 2: Dedicated Route                         │
│  - Route: /dna/feedback                                 │
│  - Full-page experience                                 │
│  - Shows all messages in scrollable feed                │
│  - Compose bar at bottom                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ENTRY POINT 3: Settings/Support Section                │
│  - Location: /dna/settings → Support → Feedback Hub     │
│  - Same as dedicated route but accessed via settings    │
│  - Also contains opt-in/opt-out toggle                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 UI Component Hierarchy

```
FeedbackHub/
├── FeedbackFAB.tsx              # Floating button component
├── FeedbackPage.tsx             # /dna/feedback route page
├── FeedbackDrawer.tsx           # Slide-out drawer (from FAB)
├── components/
│   ├── FeedbackMessageList.tsx  # Virtualized message list
│   ├── FeedbackMessage.tsx      # Individual message bubble
│   ├── FeedbackComposer.tsx     # Text/media input bar
│   ├── FeedbackMediaUpload.tsx  # Image/video upload
│   ├── FeedbackVoiceRecorder.tsx # Audio recording
│   ├── FeedbackVideoRecorder.tsx # Video recording
│   ├── FeedbackTagSelector.tsx  # Tag chips selector
│   ├── FeedbackReactions.tsx    # Emoji reaction picker
│   ├── FeedbackThreadView.tsx   # Threaded replies
│   ├── FeedbackStatusBadge.tsx  # Open/InProgress/Resolved
│   ├── FeedbackAdminControls.tsx # Pin/Status/Delete (admin)
│   └── FeedbackAnalytics.tsx    # Admin analytics dashboard
├── hooks/
│   ├── useFeedbackMessages.ts   # Fetch/realtime messages
│   ├── useFeedbackMembership.ts # Opt-in/out state
│   └── useFeedbackAnalytics.ts  # Analytics data
└── services/
    └── feedbackService.ts       # API calls
```

---

## 4. Database Schema

### 4.1 Tables

```sql
-- ============================================
-- FEEDBACK HUB DATABASE SCHEMA
-- ============================================

-- 4.1.1 Feedback Channels (Global channels, MVP: single "Alpha & Beta" channel)
CREATE TABLE public.feedback_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                          -- "Alpha & Beta Feedback"
    description TEXT,
    slug TEXT UNIQUE NOT NULL,                   -- "alpha-beta"
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.1.2 Feedback Channel Memberships (All users auto-joined, can opt-out)
CREATE TABLE public.feedback_channel_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES feedback_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'opted_out', 'muted')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    opted_out_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(channel_id, user_id)
);

-- 4.1.3 Feedback Messages (Core message storage)
CREATE TABLE public.feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES feedback_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT,                                -- Text content (max 5000 chars)
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'voice', 'video', 'mixed')),
    
    -- Threading
    parent_message_id UUID REFERENCES feedback_messages(id) ON DELETE SET NULL,
    reply_count INTEGER DEFAULT 0,
    
    -- Tagging (user-applied)
    user_tag TEXT CHECK (user_tag IN ('bug', 'suggestion', 'question', 'praise', 'other')),
    
    -- Admin categorization
    admin_category TEXT CHECK (admin_category IN ('bug', 'feature_request', 'ux_issue', 'question', 'duplicate', 'other')),
    admin_status TEXT DEFAULT 'open' CHECK (admin_status IN ('open', 'in_progress', 'resolved', 'wont_fix')),
    admin_priority TEXT CHECK (admin_priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Admin actions
    is_pinned BOOLEAN DEFAULT false,
    is_highlighted BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id),
    
    -- Admin response tracking
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4.1.4 Feedback Attachments (Media files)
CREATE TABLE public.feedback_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES feedback_messages(id) ON DELETE CASCADE,
    
    attachment_type TEXT NOT NULL CHECK (attachment_type IN ('image', 'voice', 'video')),
    storage_path TEXT NOT NULL,                  -- Supabase Storage path
    file_name TEXT,
    file_size_bytes INTEGER,
    mime_type TEXT,
    duration_seconds INTEGER,                    -- For audio/video
    width INTEGER,                               -- For images/video
    height INTEGER,
    thumbnail_path TEXT,                         -- For video thumbnails
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.1.5 Feedback Reactions (Emoji reactions)
CREATE TABLE public.feedback_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES feedback_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('👍', '❤️', '🔥', '👀', '✅')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(message_id, user_id, emoji)
);

-- 4.1.6 Feedback Admin Role (Platform owner only)
-- Uses existing app_role enum if available, otherwise create
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END $$;

-- Ensure user_roles table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_feedback_messages_channel ON feedback_messages(channel_id);
CREATE INDEX idx_feedback_messages_sender ON feedback_messages(sender_id);
CREATE INDEX idx_feedback_messages_parent ON feedback_messages(parent_message_id);
CREATE INDEX idx_feedback_messages_status ON feedback_messages(admin_status);
CREATE INDEX idx_feedback_messages_created ON feedback_messages(created_at DESC);
CREATE INDEX idx_feedback_messages_pinned ON feedback_messages(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_feedback_attachments_message ON feedback_attachments(message_id);
CREATE INDEX idx_feedback_reactions_message ON feedback_reactions(message_id);
CREATE INDEX idx_feedback_memberships_user ON feedback_channel_memberships(user_id);
CREATE INDEX idx_feedback_memberships_channel ON feedback_channel_memberships(channel_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Check if user is feedback admin (platform owner)
CREATE OR REPLACE FUNCTION public.is_feedback_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = _user_id AND role = 'admin'
    )
$$;

-- Auto-join user to default channel on signup (trigger)
CREATE OR REPLACE FUNCTION public.auto_join_feedback_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO feedback_channel_memberships (channel_id, user_id)
    SELECT id, NEW.id
    FROM feedback_channels
    WHERE is_active = true AND slug = 'alpha-beta'
    ON CONFLICT (channel_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger to auto-join new profiles to feedback channel
CREATE TRIGGER on_profile_created_join_feedback
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_join_feedback_channel();

-- Update reply count on parent message
CREATE OR REPLACE FUNCTION public.update_feedback_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_message_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_message_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_message_id IS NOT NULL THEN
        UPDATE feedback_messages
        SET reply_count = reply_count - 1
        WHERE id = OLD.parent_message_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER feedback_reply_count_trigger
AFTER INSERT OR DELETE ON feedback_messages
FOR EACH ROW
EXECUTE FUNCTION update_feedback_reply_count();

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER feedback_channels_updated_at
BEFORE UPDATE ON feedback_channels
FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

CREATE TRIGGER feedback_messages_updated_at
BEFORE UPDATE ON feedback_messages
FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE feedback_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_channel_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reactions ENABLE ROW LEVEL SECURITY;

-- Feedback Channels: All authenticated can view active channels
CREATE POLICY "Anyone can view active channels"
ON feedback_channels FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admin can manage channels
CREATE POLICY "Admin can manage channels"
ON feedback_channels FOR ALL
TO authenticated
USING (is_feedback_admin(auth.uid()))
WITH CHECK (is_feedback_admin(auth.uid()));

-- Memberships: Users can view/manage their own
CREATE POLICY "Users can view own membership"
ON feedback_channel_memberships FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own membership"
ON feedback_channel_memberships FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert memberships"
ON feedback_channel_memberships FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Messages: Active members can view non-deleted messages
CREATE POLICY "Members can view messages"
ON feedback_messages FOR SELECT
TO authenticated
USING (
    is_deleted = false
    AND EXISTS (
        SELECT 1 FROM feedback_channel_memberships
        WHERE channel_id = feedback_messages.channel_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

-- Admin can view all messages including deleted
CREATE POLICY "Admin can view all messages"
ON feedback_messages FOR SELECT
TO authenticated
USING (is_feedback_admin(auth.uid()));

-- Members can insert messages
CREATE POLICY "Members can send messages"
ON feedback_messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM feedback_channel_memberships
        WHERE channel_id = feedback_messages.channel_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

-- Admin can update any message (for status, pin, delete)
CREATE POLICY "Admin can update messages"
ON feedback_messages FOR UPDATE
TO authenticated
USING (is_feedback_admin(auth.uid()))
WITH CHECK (is_feedback_admin(auth.uid()));

-- Attachments: Same access as messages
CREATE POLICY "Members can view attachments"
ON feedback_attachments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM feedback_messages m
        JOIN feedback_channel_memberships mem ON m.channel_id = mem.channel_id
        WHERE m.id = feedback_attachments.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
        AND m.is_deleted = false
    )
);

CREATE POLICY "Members can insert attachments"
ON feedback_attachments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM feedback_messages m
        WHERE m.id = feedback_attachments.message_id
        AND m.sender_id = auth.uid()
    )
);

-- Reactions: Members can view and manage
CREATE POLICY "Members can view reactions"
ON feedback_reactions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM feedback_messages m
        JOIN feedback_channel_memberships mem ON m.channel_id = mem.channel_id
        WHERE m.id = feedback_reactions.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
    )
);

CREATE POLICY "Members can add reactions"
ON feedback_reactions FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM feedback_messages m
        JOIN feedback_channel_memberships mem ON m.channel_id = mem.channel_id
        WHERE m.id = feedback_reactions.message_id
        AND mem.user_id = auth.uid()
        AND mem.status = 'active'
    )
);

CREATE POLICY "Users can remove own reactions"
ON feedback_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for feedback media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feedback-media',
    'feedback-media',
    false,
    52428800, -- 50MB max
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'video/webm', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload feedback media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view feedback media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'feedback-media');

-- ============================================
-- SEED DATA
-- ============================================

-- Create default feedback channel
INSERT INTO feedback_channels (name, description, slug, is_active)
VALUES (
    'Alpha & Beta Feedback',
    'Share your feedback, report bugs, suggest features, and help us build DNA together!',
    'alpha-beta',
    true
) ON CONFLICT (slug) DO NOTHING;
```

### 4.2 Entity Relationship Diagram

```
┌────────────────────┐       ┌──────────────────────────┐
│ feedback_channels  │       │ feedback_channel_        │
│ ────────────────── │──────<│ memberships              │
│ id (PK)            │       │ ────────────────────────│
│ name               │       │ id (PK)                  │
│ description        │       │ channel_id (FK)          │
│ slug (UNIQUE)      │       │ user_id (FK → auth.users)│
│ is_active          │       │ status                   │
└────────────────────┘       │ joined_at                │
         │                   │ opted_out_at             │
         │                   │ last_read_at             │
         ▼                   └──────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ feedback_messages                                       │
│ ──────────────────────────────────────────────────────  │
│ id (PK)                                                 │
│ channel_id (FK)                                         │
│ sender_id (FK → auth.users)                             │
│ content                                                 │
│ content_type (text/image/voice/video/mixed)             │
│ parent_message_id (FK → self, nullable)                 │
│ reply_count                                             │
│ user_tag (bug/suggestion/question/praise/other)         │
│ admin_category                                          │
│ admin_status (open/in_progress/resolved/wont_fix)       │
│ admin_priority (low/medium/high/critical)               │
│ is_pinned, is_highlighted, is_deleted                   │
│ created_at, updated_at                                  │
└────────────────────────────────────────────────────────┘
         │                            │
         ▼                            ▼
┌─────────────────────┐    ┌────────────────────┐
│ feedback_attachments│    │ feedback_reactions │
│ ─────────────────── │    │ ────────────────── │
│ id (PK)             │    │ id (PK)            │
│ message_id (FK)     │    │ message_id (FK)    │
│ attachment_type     │    │ user_id (FK)       │
│ storage_path        │    │ emoji              │
│ file_name           │    │ created_at         │
│ file_size_bytes     │    └────────────────────┘
│ mime_type           │
│ duration_seconds    │
│ width, height       │
│ thumbnail_path      │
└─────────────────────┘
```

---

## 5. API & Service Layer

### 5.1 feedbackService.ts

```typescript
// src/services/feedbackService.ts

export const feedbackService = {
  // ============================================
  // CHANNEL OPERATIONS
  // ============================================
  
  async getDefaultChannel(): Promise<FeedbackChannel> {
    // Returns the 'alpha-beta' channel
  },
  
  async getMembership(userId: string, channelId: string): Promise<FeedbackMembership | null> {
    // Check if user is member and their status
  },
  
  async optOut(channelId: string): Promise<void> {
    // Set status = 'opted_out'
  },
  
  async optIn(channelId: string): Promise<void> {
    // Set status = 'active'
  },
  
  async updateLastRead(channelId: string): Promise<void> {
    // Update last_read_at timestamp
  },

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================
  
  async getMessages(
    channelId: string,
    options: { 
      limit: number; 
      cursor?: string; 
      filter?: 'all' | 'pinned' | 'my_feedback' 
    }
  ): Promise<PaginatedMessages> {
    // Fetch messages with pagination, ordered by pinned first, then created_at DESC
  },
  
  async sendMessage(params: {
    channelId: string;
    content: string;
    contentType: 'text' | 'image' | 'voice' | 'video' | 'mixed';
    userTag?: UserTag;
    parentMessageId?: string;
  }): Promise<FeedbackMessage> {
    // Insert message, return created message
  },
  
  async getThread(parentMessageId: string): Promise<FeedbackMessage[]> {
    // Fetch all replies to a message
  },

  // ============================================
  // ATTACHMENT OPERATIONS
  // ============================================
  
  async uploadAttachment(
    messageId: string,
    file: File,
    type: 'image' | 'voice' | 'video'
  ): Promise<FeedbackAttachment> {
    // Upload to storage, create attachment record
  },
  
  async getAttachmentUrl(storagePath: string): Promise<string> {
    // Get signed URL for attachment
  },

  // ============================================
  // REACTION OPERATIONS
  // ============================================
  
  async addReaction(messageId: string, emoji: Emoji): Promise<void> {
    // Insert reaction (upsert to avoid duplicates)
  },
  
  async removeReaction(messageId: string, emoji: Emoji): Promise<void> {
    // Delete reaction
  },
  
  async getReactions(messageId: string): Promise<ReactionSummary> {
    // Get aggregated reactions with counts
  },

  // ============================================
  // ADMIN OPERATIONS
  // ============================================
  
  async updateMessageStatus(
    messageId: string, 
    status: AdminStatus
  ): Promise<void> {
    // Admin only: update status, set resolved_at if resolved
  },
  
  async updateMessageCategory(
    messageId: string, 
    category: AdminCategory
  ): Promise<void> {
    // Admin only: categorize feedback
  },
  
  async updateMessagePriority(
    messageId: string, 
    priority: AdminPriority
  ): Promise<void> {
    // Admin only: set priority
  },
  
  async pinMessage(messageId: string, pinned: boolean): Promise<void> {
    // Admin only: toggle pin
  },
  
  async highlightMessage(messageId: string, highlighted: boolean): Promise<void> {
    // Admin only: toggle highlight
  },
  
  async deleteMessage(messageId: string): Promise<void> {
    // Admin only: soft delete
  },

  // ============================================
  // ANALYTICS (ADMIN ONLY)
  // ============================================
  
  async getAnalytics(channelId: string, dateRange: DateRange): Promise<FeedbackAnalytics> {
    // Total messages, by type, by status, resolution rate, trending, top contributors
  },

  // ============================================
  // REALTIME SUBSCRIPTIONS
  // ============================================
  
  subscribeToMessages(
    channelId: string, 
    onNewMessage: (msg: FeedbackMessage) => void
  ): RealtimeChannel {
    // Subscribe to INSERT events on feedback_messages
  },
  
  subscribeToReactions(
    messageId: string,
    onReactionChange: (reactions: ReactionSummary) => void
  ): RealtimeChannel {
    // Subscribe to INSERT/DELETE on feedback_reactions
  },
};
```

### 5.2 TypeScript Types

```typescript
// src/types/feedback.ts

export type UserTag = 'bug' | 'suggestion' | 'question' | 'praise' | 'other';
export type AdminCategory = 'bug' | 'feature_request' | 'ux_issue' | 'question' | 'duplicate' | 'other';
export type AdminStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';
export type AdminPriority = 'low' | 'medium' | 'high' | 'critical';
export type ContentType = 'text' | 'image' | 'voice' | 'video' | 'mixed';
export type AttachmentType = 'image' | 'voice' | 'video';
export type Emoji = '👍' | '❤️' | '🔥' | '👀' | '✅';
export type MembershipStatus = 'active' | 'opted_out' | 'muted';

export interface FeedbackChannel {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackMembership {
  id: string;
  channel_id: string;
  user_id: string;
  status: MembershipStatus;
  joined_at: string;
  opted_out_at: string | null;
  last_read_at: string;
}

export interface FeedbackMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string | null;
  content_type: ContentType;
  parent_message_id: string | null;
  reply_count: number;
  user_tag: UserTag | null;
  admin_category: AdminCategory | null;
  admin_status: AdminStatus;
  admin_priority: AdminPriority | null;
  is_pinned: boolean;
  is_highlighted: boolean;
  is_deleted: boolean;
  first_response_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  sender?: PublicProfile;
  attachments?: FeedbackAttachment[];
  reactions?: ReactionSummary;
}

export interface FeedbackAttachment {
  id: string;
  message_id: string;
  attachment_type: AttachmentType;
  storage_path: string;
  file_name: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  created_at: string;
}

export interface FeedbackReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: Emoji;
  created_at: string;
}

export interface ReactionSummary {
  [emoji: string]: {
    count: number;
    users: string[]; // user IDs
    reacted_by_me: boolean;
  };
}

export interface FeedbackAnalytics {
  total_messages: number;
  by_status: Record<AdminStatus, number>;
  by_category: Record<AdminCategory, number>;
  by_user_tag: Record<UserTag, number>;
  resolution_rate: number;
  avg_resolution_time_hours: number;
  trending_issues: FeedbackMessage[];
  top_contributors: { user_id: string; count: number; profile: PublicProfile }[];
  messages_over_time: { date: string; count: number }[];
}
```

---

## 6. UI/UX Specifications

### 6.1 Floating Action Button (FAB)

**Design:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                        ┌────────┐   │
│                                        │ 💬     │   │
│                                        │        │   │
│                                        └────────┘   │
│                                        ↑            │
│                                   FAB Position      │
│                                   (bottom-right)    │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Fixed position: `bottom-6 right-6`
- Z-index: Above content, below modals
- Responsive: Moves up if overlapping bottom nav on mobile
- Animation: Subtle pulse on hover, scale on click
- Badge: Shows unread count (admin only sees total new)
- Click: Opens drawer (mobile) or navigates to /dna/feedback (desktop)

### 6.2 Feedback Drawer (Mobile)

**Layout:**
```
┌─────────────────────────────────────────┐
│ ╳  Alpha & Beta Feedback           ⚙️   │ ← Header with close & settings
├─────────────────────────────────────────┤
│ 📌 PINNED                               │
│ ┌─────────────────────────────────────┐ │
│ │ @Admin                    2 days ago │ │
│ │ Welcome! Share your feedback here   │ │
│ │ ✅ Resolved                          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ @ObiChukwu              10 min ago  │ │
│ │ The connect page loads slowly       │ │
│ │ #bug                                 │ │
│ │ 👍 5  ❤️ 2                     💬 3  │ │
│ │ 🔵 Open                              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ @Amara                    5 min ago │ │
│ │ [🎤 Voice Message 0:42]             │ │
│ │ #suggestion                          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ @Kwame                    2 min ago │ │
│ │ [📷 Screenshot attached]            │ │
│ │ Login button not working on Safari  │ │
│ │ #bug                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ ┌───┬───┬───┬───────────────────┬─────┐ │
│ │ 📷│ 🎤│ 🎥│ Type feedback...  │ ➤  │ │ ← Composer
│ └───┴───┴───┴───────────────────┴─────┘ │
│ Tags: #bug #suggestion #question #praise│
└─────────────────────────────────────────┘
```

### 6.3 Full Page (/dna/feedback)

**Desktop Layout:**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DNA | Feedback Hub                                              [Analytics] │
├────────────────────────────┬─────────────────────────────────────────────────┤
│                            │                                                 │
│  FILTERS                   │  📌 Pinned Messages                             │
│  ────────────────          │  ┌───────────────────────────────────────────┐  │
│  ○ All Feedback            │  │ Welcome message from Admin...            │  │
│  ○ My Feedback             │  └───────────────────────────────────────────┘  │
│  ○ Pinned                  │                                                 │
│                            │  ──────────────────────────────────────────────  │
│  STATUS                    │                                                 │
│  ────────────────          │  [Message bubbles with reactions, tags, status] │
│  ☑ Open (24)               │                                                 │
│  ☑ In Progress (8)         │                                                 │
│  ☐ Resolved (156)          │                                                 │
│  ☐ Won't Fix (12)          │                                                 │
│                            │                                                 │
│  TAGS                      │                                                 │
│  ────────────────          │                                                 │
│  ☑ #bug (45)               │                                                 │
│  ☑ #suggestion (67)        │                                                 │
│  ☑ #question (23)          │                                                 │
│  ☑ #praise (15)            │                                                 │
│                            │                                                 │
│  ────────────────          │                                                 │
│  🔔 Opted In               │  ┌───┬───┬───┬─────────────────────┬─────────┐  │
│  [Opt Out]                 │  │ 📷│ 🎤│ 🎥│ Type feedback...    │   ➤     │  │
│                            │  └───┴───┴───┴─────────────────────┴─────────┘  │
│                            │  Tags: #bug #suggestion #question #praise       │
└────────────────────────────┴─────────────────────────────────────────────────┘
```

### 6.4 Admin Analytics Dashboard

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  📊 Feedback Analytics                                    [Last 30 days ▼]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total        │ │ Open         │ │ Resolution   │ │ Avg Response │        │
│  │ 245          │ │ 24           │ │ Rate         │ │ Time         │        │
│  │ +12% ↑       │ │ -5 from yday │ │ 78%          │ │ 4.2 hours    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                              │
│  ┌────────────────────────────────┐ ┌────────────────────────────────────┐   │
│  │ Feedback by Category           │ │ Messages Over Time                 │   │
│  │ ═════════════════════════════  │ │ ═════════════════════════════════  │   │
│  │ Bug Reports     ████████ 45    │ │ [Line chart showing trend]         │   │
│  │ Suggestions     ██████████ 67  │ │                                    │   │
│  │ Questions       ████ 23        │ │                                    │   │
│  │ Praise          ███ 15         │ │                                    │   │
│  └────────────────────────────────┘ └────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 🔥 Trending Issues (Most Upvoted)                                      │  │
│  │ ═══════════════════════════════════════════════════════════════════════│  │
│  │ 1. "Login slow on mobile" - 👍 45 - @ObiChukwu - 🔵 Open               │  │
│  │ 2. "Add dark mode" - 👍 38 - @Amara - 🟡 In Progress                   │  │
│  │ 3. "Profile picture upload fails" - 👍 27 - @Kwame - ✅ Resolved       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ 🏆 Top Contributors                                                    │  │
│  │ ═══════════════════════════════════════════════════════════════════════│  │
│  │ 1. @ObiChukwu - 23 feedbacks                                           │  │
│  │ 2. @Amara - 18 feedbacks                                               │  │
│  │ 3. @Kwame - 15 feedbacks                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.5 Message Bubble Component

**States:**
```
┌─────────────────────────────────────────────────────────────────┐
│ REGULAR MESSAGE                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Avatar] @ObiChukwu                             10 min ago  │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ The login page loads slowly on mobile devices. I've tried  │ │
│ │ refreshing but it takes about 5 seconds each time.         │ │
│ │                                                             │ │
│ │ [📷 Screenshot.png]                                         │ │
│ │                                                             │ │
│ │ #bug                                                        │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ 👍 5  ❤️ 2  🔥 1                              💬 3 replies  │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ 🔵 Open                               [Reply] [React 😊]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ADMIN MESSAGE (with badge)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Avatar] @Makena 👑 Admin                        2 days ago │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ Thanks for reporting! We've identified the issue and are   │ │
│ │ working on a fix. ETA: end of week.                         │ │
│ │                                                             │ │
│ │ 🟡 In Progress                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PINNED MESSAGE                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📌 PINNED                                                   │ │
│ │ [Avatar] @Makena 👑 Admin                       1 week ago  │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ Welcome to the DNA Feedback Hub! 🎉                         │ │
│ │                                                             │ │
│ │ This is your space to:                                      │ │
│ │ • Report bugs 🐛                                            │ │
│ │ • Suggest features 💡                                       │ │
│ │ • Ask questions ❓                                          │ │
│ │ • Share praise 🙌                                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HIGHLIGHTED / PRIORITY MESSAGE                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚡ HIGHLIGHTED                                   🔴 Critical │ │
│ │ [Avatar] @Amara                                  1 hour ago │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ Users cannot complete checkout - payments failing!          │ │
│ │                                                             │ │
│ │ #bug                                                        │ │
│ │ 🟡 In Progress                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.6 Composer Bar

**States:**
```
┌─────────────────────────────────────────────────────────────────┐
│ DEFAULT STATE                                                   │
│ ┌───┬───┬───┬───────────────────────────────────────────┬─────┐ │
│ │ 📷│ 🎤│ 🎥│ Share your feedback...                    │  ➤  │ │
│ └───┴───┴───┴───────────────────────────────────────────┴─────┘ │
│ Quick tags: [#bug] [#suggestion] [#question] [#praise]          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ WITH ATTACHMENT PREVIEW                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [📷 thumbnail.png ✕]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌───┬───┬───┬───────────────────────────────────────────┬─────┐ │
│ │ 📷│ 🎤│ 🎥│ The button doesn't work when...           │  ➤  │ │
│ └───┴───┴───┴───────────────────────────────────────────┴─────┘ │
│ Selected: [#bug ✕]                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ RECORDING VOICE                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔴 Recording... 0:23          [⏹ Stop] [🗑 Cancel]         │ │
│ │ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ Waveform visualization          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ REPLYING TO MESSAGE                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ↩ Replying to @ObiChukwu: "The login page loads..."    [✕] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌───┬───┬───┬───────────────────────────────────────────┬─────┐ │
│ │ 📷│ 🎤│ 🎥│ I also noticed this on...                 │  ➤  │ │
│ └───┴───┴───┴───────────────────────────────────────────┴─────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Notifications

### 7.1 In-App Notifications

**Trigger Events:**
| Event | Recipient | Notification |
|-------|-----------|--------------|
| Status changed | Message author | "Your feedback is now In Progress" |
| Resolved | Message author | "Your feedback has been resolved! ✅" |
| Admin reply | Message author | "Admin responded to your feedback" |
| Reaction received | Message author | "@Amara reacted 👍 to your feedback" |
| Reply received | Message author | "@Kwame replied to your feedback" |

### 7.2 Email Notifications

**Templates:**

1. **Status Change Email**
```
Subject: Your DNA feedback is now In Progress

Hi [Name],

Great news! Your feedback is being worked on.

Your feedback:
"[Message preview...]"

Status: 🟡 In Progress

View in DNA →

---
You're receiving this because you submitted feedback on DNA.
[Unsubscribe from feedback notifications]
```

2. **Resolution Email**
```
Subject: Your DNA feedback has been resolved! ✅

Hi [Name],

Your feedback has been addressed and resolved!

Your feedback:
"[Message preview...]"

Status: ✅ Resolved

Thank you for helping us improve DNA!

View in DNA →
```

---

## 8. Integration Points

### 8.1 With Existing DNA Systems

| System | Integration |
|--------|-------------|
| **Auth** | Uses existing Supabase auth; `auth.uid()` for user identification |
| **Profiles** | Joins to `profiles` for sender display name, avatar |
| **Notifications** | Uses existing `notifications` table for in-app notifications |
| **Email** | Uses existing email edge function for notification emails |
| **Storage** | New `feedback-media` bucket in Supabase Storage |
| **User Roles** | Uses existing `user_roles` table for admin check |

### 8.2 Routes to Add

```typescript
// src/App.tsx or router config

// Add these routes:
{ path: '/dna/feedback', element: <FeedbackPage /> }
{ path: '/dna/settings/support', element: <SupportSettings /> } // if not exists
```

### 8.3 Navigation Updates

```typescript
// Add FAB to authenticated layout
// Add link in Settings > Support section
// Add sidebar entry if desired
```

---

## 9. Implementation Phases

### Phase 1: Foundation (MVP)
**Estimated Effort: 3-4 days**

- [ ] Database schema & migrations
- [ ] Storage bucket setup
- [ ] feedbackService.ts (core methods)
- [ ] Types (feedback.ts)
- [ ] Basic FeedbackPage with message list
- [ ] FeedbackComposer (text only)
- [ ] FeedbackMessage component (basic)
- [ ] Route setup (/dna/feedback)

### Phase 2: Rich Media
**Estimated Effort: 2-3 days**

- [ ] Image upload & preview
- [ ] Voice recording (use existing VoiceMessageRecorder if available)
- [ ] Video recording
- [ ] Attachment display in messages
- [ ] Storage upload service

### Phase 3: Engagement Features
**Estimated Effort: 2 days**

- [ ] Emoji reactions (add/remove)
- [ ] Threaded replies
- [ ] Tag selector (#bug, #suggestion, etc.)
- [ ] Realtime subscriptions

### Phase 4: Admin Tools
**Estimated Effort: 2 days**

- [ ] Admin role check
- [ ] Status change controls
- [ ] Pin/highlight controls
- [ ] Category assignment
- [ ] Priority assignment
- [ ] Soft delete

### Phase 5: Navigation & Polish
**Estimated Effort: 1-2 days**

- [ ] Floating Action Button (FAB)
- [ ] Drawer for mobile
- [ ] Settings > Support integration
- [ ] Opt-in/opt-out toggle
- [ ] Responsive design polish

### Phase 6: Notifications
**Estimated Effort: 1-2 days**

- [ ] In-app notification triggers
- [ ] Email notification templates
- [ ] Notification preferences

### Phase 7: Analytics
**Estimated Effort: 2 days**

- [ ] Analytics queries
- [ ] FeedbackAnalytics component
- [ ] Charts (using recharts)
- [ ] Trending issues
- [ ] Top contributors

---

## 10. Security Checklist

- [ ] RLS policies tested for all tables
- [ ] Admin functions use SECURITY DEFINER
- [ ] Storage policies restrict uploads to authenticated users
- [ ] Soft delete preserves audit trail
- [ ] No client-side admin checks (all server-side via RLS)
- [ ] Rate limiting on message sends (consider edge function)
- [ ] File type validation on uploads
- [ ] File size limits enforced

---

## 11. Testing Requirements

### 11.1 User Flows to Test
- [ ] New user auto-joins feedback channel
- [ ] Send text message with tag
- [ ] Upload image attachment
- [ ] Record and send voice note
- [ ] Record and send video clip
- [ ] Add/remove reactions
- [ ] Reply to message (thread)
- [ ] Opt-out and opt-in
- [ ] View own feedback filtered
- [ ] Realtime: new message appears without refresh

### 11.2 Admin Flows to Test
- [ ] Change message status
- [ ] Pin/unpin message
- [ ] Set priority
- [ ] Categorize feedback
- [ ] Soft delete message
- [ ] View analytics dashboard
- [ ] Non-admin cannot access admin controls

---

## 12. Open Questions / Future Enhancements

1. **Search:** Full-text search within feedback messages?
2. **Mentions:** @mention other users in feedback?
3. **Duplicate Detection:** AI-assisted duplicate detection?
4. **Public Roadmap:** Surface resolved feedback as "What's New"?
5. **Voting:** Beyond reactions, allow formal upvoting for prioritization?
6. **Multiple Channels:** Future need for separate channels (e.g., by feature area)?

---

## 13. Appendix: File Structure

```
src/
├── components/
│   └── feedback/
│       ├── FeedbackFAB.tsx
│       ├── FeedbackDrawer.tsx
│       ├── FeedbackPage.tsx
│       ├── FeedbackMessageList.tsx
│       ├── FeedbackMessage.tsx
│       ├── FeedbackComposer.tsx
│       ├── FeedbackTagSelector.tsx
│       ├── FeedbackReactions.tsx
│       ├── FeedbackThreadView.tsx
│       ├── FeedbackStatusBadge.tsx
│       ├── FeedbackAdminControls.tsx
│       ├── FeedbackAnalytics.tsx
│       ├── FeedbackMediaUpload.tsx
│       ├── FeedbackVoiceRecorder.tsx
│       └── FeedbackVideoRecorder.tsx
├── hooks/
│   ├── useFeedbackMessages.ts
│   ├── useFeedbackMembership.ts
│   └── useFeedbackAnalytics.ts
├── services/
│   └── feedbackService.ts
├── types/
│   └── feedback.ts
└── pages/
    └── dna/
        └── FeedbackPage.tsx
```

---

## 14. Ready for Claude Code

This PRD is complete and ready for implementation. Claude Code should:

1. **Start with Phase 1** (Database & Foundation)
2. **Reference this document** for all schema, types, and component specs
3. **Follow DNA's Engineering OS** for code patterns and security
4. **Use existing components** where available (e.g., VoiceMessageRecorder)
5. **Integrate with existing systems** (auth, profiles, notifications)

**Handoff Confirmed ✅**

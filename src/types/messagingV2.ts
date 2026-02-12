/**
 * DNA | Messaging System V2 — Extended Type System
 *
 * The connective tissue between people. Messaging makes CONNECT, CONVENE,
 * and COLLABORATE actually work.
 *
 * Extends the existing messaging types with:
 * - Group conversations (up to 50 participants)
 * - Space channels (tied to collaboration spaces)
 * - Event threads (pre/post event discussion)
 * - Opportunity threads (need ↔ offer negotiation)
 * - DIA smart replies and conversation insights
 */

import type { FiveCModule, SubscriptionTier } from './dia';
import type {
  ConversationType,
  ConversationOriginType,
  MessageContentType,
  MessageMetadata,
  ParticipantStatus,
} from './messaging';

// =====================================================
// EXTENDED CONVERSATION TYPES
// =====================================================

/** Full conversation type enum covering all messaging patterns */
export type ConversationTypeV2 =
  | 'direct'              // 1:1 between two users (CONNECT)
  | 'group'               // Multi-party discussion (CONNECT)
  | 'space_channel'       // Tied to a collaboration space (COLLABORATE)
  | 'event_thread'        // Tied to an event (CONVENE)
  | 'opportunity_thread'; // Need ↔ Offer negotiation (CONTRIBUTE)

/** Extended origin types */
export type ConversationOriginTypeV2 =
  | ConversationOriginType  // Existing: 'event' | 'project' | 'profile' | 'post' | null
  | 'space'
  | 'opportunity'
  | 'dia_introduction';

// =====================================================
// GROUP CONVERSATIONS
// =====================================================

/**
 * Group conversation — multi-party discussions from connections.
 * Free: up to 10 participants. Pro: up to 50. Org: up to 200.
 */
export interface GroupConversation {
  id: string;
  type: 'group';
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  participant_count: number;
  max_participants: number; // Tier-gated
  is_muted: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  last_message_preview: string | null;
}

export interface GroupParticipant {
  user_id: string;
  role: GroupParticipantRole;
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
}

export type GroupParticipantRole = 'admin' | 'member';

// =====================================================
// SPACE CHANNELS
// =====================================================

/**
 * Space channels — project/group communication tied to a collaboration space.
 * Supports topic channels and pinned messages.
 */
export interface SpaceChannel {
  id: string;
  type: 'space_channel';
  space_id: string;
  space_title: string;
  channel_name: string; // e.g., "general", "design", "development"
  channel_topic?: string;
  is_default: boolean; // Every space has a default "general" channel
  participant_count: number;
  pinned_message_ids: string[];
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
}

/** Default channels created with every new space */
export const DEFAULT_SPACE_CHANNELS = ['general', 'announcements'] as const;

// =====================================================
// EVENT THREADS
// =====================================================

/**
 * Event threads — pre/post event discussion for attendees.
 * Only visible to registered attendees and organizers.
 */
export interface EventThread {
  id: string;
  type: 'event_thread';
  event_id: string;
  event_title: string;
  thread_phase: EventThreadPhase;
  participant_count: number;
  is_organizer_only: boolean; // Organizer announcements
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
}

export type EventThreadPhase = 'pre_event' | 'during_event' | 'post_event';

// =====================================================
// OPPORTUNITY THREADS
// =====================================================

/**
 * Opportunity threads — structured conversation between poster and interested party.
 * For negotiating needs ↔ offers in the CONTRIBUTE module.
 */
export interface OpportunityThread {
  id: string;
  type: 'opportunity_thread';
  opportunity_id: string;
  opportunity_title: string;
  poster_id: string;
  interested_party_id: string;
  status: OpportunityThreadStatus;
  created_at: string;
  last_message_at: string;
  last_message_preview: string | null;
}

export type OpportunityThreadStatus =
  | 'inquiry'      // Initial contact
  | 'negotiation'  // Active discussion
  | 'agreed'       // Terms agreed
  | 'fulfilled'    // Contribution completed
  | 'declined';    // Either party declined

// =====================================================
// EXTENDED MESSAGE TYPES
// =====================================================

/** Additional content types for V2 messaging */
export type MessageContentTypeV2 =
  | MessageContentType // Existing: 'text' | 'image' | 'file' | 'link_preview' | 'system'
  | 'voice_note'
  | 'event_card'      // Inline event card in messages
  | 'opportunity_card' // Inline opportunity card
  | 'dia_suggestion';  // DIA smart reply suggestion

/** Extended message metadata for V2 content types */
export interface MessageMetadataV2 extends MessageMetadata {
  // Voice notes
  voice_url?: string;
  voice_duration_seconds?: number;
  voice_waveform?: number[];

  // Inline cards
  card_entity_id?: string;
  card_entity_type?: 'event' | 'opportunity' | 'space' | 'profile';

  // DIA suggestion metadata
  dia_suggestion_type?: 'smart_reply' | 'introduction' | 'meeting_suggestion';
  dia_confidence?: number;

  // Thread reference (for replies)
  reply_to_message_id?: string;
  reply_to_preview?: string;
}

// =====================================================
// DIA MESSAGING INTELLIGENCE
// =====================================================

/**
 * DIA integration points within messaging.
 */
export interface DIAMessagingFeatures {
  /** Smart quick-reply suggestions based on conversation context */
  smart_replies: SmartReply[];

  /** DIA-facilitated introductions: "You and Sarah both work in supply chain" */
  introduction_suggestions: IntroductionSuggestion[];

  /** Detect when a space conversation needs a meeting */
  meeting_suggestions: MeetingSuggestion[];

  /** Space channel conversation summaries (Pro+) */
  conversation_summary: ConversationSummary | null;
}

export interface SmartReply {
  text: string;
  confidence: number;
  tone: 'professional' | 'casual' | 'enthusiastic';
}

export interface IntroductionSuggestion {
  target_user_id: string;
  target_user_name: string;
  reason: string; // "You both work in supply chain"
  mutual_connections: number;
}

export interface MeetingSuggestion {
  conversation_id: string;
  reason: string; // "This conversation might benefit from a live session"
  suggested_title: string;
  suggested_participants: string[];
}

export interface ConversationSummary {
  conversation_id: string;
  key_decisions: string[];
  action_items: string[];
  generated_at: string;
}

// =====================================================
// OFFLINE SUPPORT
// =====================================================

/**
 * Offline message queue — critical for African connectivity patterns.
 * Messages are queued when offline and sent when reconnected.
 */
export interface QueuedMessage {
  local_id: string;
  conversation_id: string;
  content: string;
  content_type: MessageContentTypeV2;
  metadata?: MessageMetadataV2;
  queued_at: string;
  retry_count: number;
  status: 'queued' | 'sending' | 'sent' | 'failed';
}

// =====================================================
// MESSAGING TIER LIMITS
// =====================================================

export interface MessagingTierLimits {
  tier: SubscriptionTier;
  max_group_participants: number;
  space_channels: 'join_only' | 'create_moderate' | 'admin_analytics';
  media_size_limit_mb: number;
  message_search_window: 'last_30_days' | 'unlimited';
  dia_smart_replies: boolean;
  conversation_insights: boolean;
}

export const MESSAGING_TIER_LIMITS: Record<SubscriptionTier, MessagingTierLimits> = {
  free: {
    tier: 'free',
    max_group_participants: 10,
    space_channels: 'join_only',
    media_size_limit_mb: 5,
    message_search_window: 'last_30_days',
    dia_smart_replies: false,
    conversation_insights: false,
  },
  pro: {
    tier: 'pro',
    max_group_participants: 50,
    space_channels: 'create_moderate',
    media_size_limit_mb: 25,
    message_search_window: 'unlimited',
    dia_smart_replies: true,
    conversation_insights: false,
  },
  org: {
    tier: 'org',
    max_group_participants: 200,
    space_channels: 'admin_analytics',
    media_size_limit_mb: 100,
    message_search_window: 'unlimited',
    dia_smart_replies: true,
    conversation_insights: true,
  },
};

// =====================================================
// UNIFIED CONVERSATION LIST ITEM (V2)
// =====================================================

/**
 * Unified conversation list item that works across all conversation types.
 * This extends the existing ConversationListItem to support V2 types.
 */
export interface ConversationListItemV2 {
  conversation_id: string;
  conversation_type: ConversationTypeV2;

  // Display info (adapts based on type)
  display_name: string;
  display_avatar: string | null;
  display_subtitle?: string; // e.g., "Space: Design Team" or "Event: AfroTech 2026"

  // Context reference
  origin_type: ConversationOriginTypeV2;
  origin_id: string | null;
  source_module: FiveCModule;

  // Message preview
  last_message_content: string | null;
  last_message_sender_name: string | null;
  last_message_at: string | null;

  // Status
  unread_count: number;
  is_muted: boolean;
  is_pinned: boolean;
  is_archived: boolean;

  // Group/channel specific
  participant_count?: number;
}

/**
 * DNA Messaging System — Complete Type System (PRD)
 *
 * The connective tissue that makes DNA a living network. Every conversation
 * exists in context — there is no "generic chat." Every thread connects to
 * a C module (connection, event, space, opportunity, or story).
 *
 * Five conversation types mapped to the Five C's:
 * - Direct Message (CONNECT) — 1:1 personal conversation
 * - Group Conversation (CONNECT) — Multi-party discussion among connections
 * - Event Thread (CONVENE) — Pre/during/post event communication
 * - Space Channel (COLLABORATE) — Project communication with topic channels
 * - Opportunity Thread (CONTRIBUTE) — Need <> Offer negotiation
 *
 * Dependencies: DIA Core Engine, Notification System, Profile & Identity
 */

import type { CModule } from './composer';

// ============================================================
// CONVERSATIONS
// ============================================================

export interface Conversation {
  id: string;
  type: ConversationType;
  cModule: CModule;

  // Metadata
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  createdBy: string;

  // Context link (connects to C module)
  contextType: ConversationContextType | null;
  contextId: string | null;

  // Participants
  participantCount: number;
  participantLimit: number;

  // State
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  lastMessageSenderName: string | null;
  messageCount: number;
  pinnedMessageCount: number;

  // Settings
  muteStatus: MuteStatus;
  isArchived: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type MuteStatus = 'unmuted' | 'muted_1h' | 'muted_8h' | 'muted_24h' | 'muted_forever';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  EVENT_THREAD = 'event_thread',
  SPACE_CHANNEL = 'space_channel',
  OPPORTUNITY_THREAD = 'opportunity_thread',
}

export type ConversationContextType = 'event' | 'space' | 'opportunity';

// ============================================================
// PARTICIPANTS
// ============================================================

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  lastReadAt: Date | null;
  lastReadMessageId: string | null;
  unreadCount: number;
  muteUntil: Date | null;
  isTyping: boolean;
  lastActiveAt: Date | null;
  nickname: string | null;
}

export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  OBSERVER = 'observer',
}

// ============================================================
// MESSAGES
// ============================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;

  // Content
  content: string;
  contentType: MessageContentType;
  media: MessageMedia[];
  replyToMessageId: string | null;
  replyToPreview: string | null;

  // Metadata
  isPinned: boolean;
  isEdited: boolean;
  editedAt: Date | null;
  isSystemMessage: boolean;
  systemMessageType: SystemMessageType | null;

  // Cross-C references
  crossCReferences: CrossCReference[];

  // Reactions
  reactions: MessageReaction[];

  // Read tracking
  readBy: string[];

  // Status
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  VOICE_NOTE = 'voice_note',
  LINK = 'link',
  SYSTEM = 'system',
  DIA_SUGGESTION = 'dia_suggestion',
}

export interface MessageMedia {
  id: string;
  type: 'image' | 'document' | 'voice_note';
  url: string;
  thumbnailUrl: string | null;
  fileName: string | null;
  fileSize: number;
  mimeType: string;
  duration: number | null;
  width: number | null;
  height: number | null;
}

export type SystemMessageType =
  | 'participant_joined'
  | 'participant_left'
  | 'participant_added'
  | 'participant_removed'
  | 'conversation_created'
  | 'title_changed'
  | 'event_updated'
  | 'task_referenced'
  | 'opportunity_status_changed'
  | 'space_milestone';

// ============================================================
// CROSS-C REFERENCES (messages that bridge modules)
// ============================================================

export interface CrossCReference {
  type: 'event' | 'space' | 'opportunity' | 'story' | 'profile' | 'task';
  id: string;
  title: string;
  cModule: CModule;
  action: 'view' | 'rsvp' | 'join' | 'express_interest';
}

// ============================================================
// REACTIONS
// ============================================================

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export const SUPPORTED_REACTIONS = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F525}', '\u{1F44F}', '\u{1F4A1}', '\u{1F64F}'] as const;

export type SupportedReaction = typeof SUPPORTED_REACTIONS[number];

// ============================================================
// MESSAGE STATUS
// ============================================================

export enum MessageStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// ============================================================
// TYPING INDICATOR
// ============================================================

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

// ============================================================
// CONVERSATION LIST (inbox view)
// ============================================================

export interface ConversationListState {
  conversations: ConversationPreview[];
  filter: ConversationFilter;
  hasMore: boolean;
  isLoading: boolean;
  totalUnread: number;
}

export interface ConversationPreview {
  conversation: Conversation;
  participant: ConversationParticipant;
  otherParticipants: ParticipantPreview[];
  unreadCount: number;
  isPinned: boolean;
  directRecipient: DirectRecipientInfo | null;
}

export interface DirectRecipientInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  headline: string | null;
}

export interface ParticipantPreview {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: ParticipantRole;
}

export interface ConversationFilter {
  type: ConversationType | 'all';
  readStatus: 'all' | 'unread';
  searchQuery: string;
}

// ============================================================
// DIA SMART FEATURES
// ============================================================

export interface DIASmartReply {
  id: string;
  text: string;
  confidence: number;
  context: string;
}

export interface DIAConversationSuggestion {
  type: 'introduction' | 'meeting' | 'follow_up' | 'cross_c_action';
  headline: string;
  body: string;
  action: {
    type: string;
    label: string;
    payload: Record<string, unknown>;
  };
}

// ============================================================
// OFFLINE QUEUE
// ============================================================

export type OfflineQueueItemType = 'send_message' | 'send_reaction' | 'mark_read' | 'send_typing';
export type OfflineQueueItemStatus = 'queued' | 'retrying' | 'sent' | 'failed';

export interface OfflineQueueItem {
  id: string;
  type: OfflineQueueItemType;
  payload: Record<string, unknown>;
  createdAt: Date;
  retryCount: number;
  maxRetries: number;
  status: OfflineQueueItemStatus;
}

export interface OfflineQueueState {
  items: OfflineQueueItem[];
  isOnline: boolean;
  lastSyncAt: Date | null;
  isSyncing: boolean;
}

// ============================================================
// SERVICE PARAMS
// ============================================================

export interface CreateDirectConversationParams {
  userId: string;
  recipientId: string;
}

export interface CreateGroupConversationParams {
  title: string;
  participantIds: string[];
  imageUrl?: string;
}

export interface CreateEventThreadParams {
  eventId: string;
  organizerId: string;
}

export interface CreateSpaceChannelParams {
  spaceId: string;
  creatorId: string;
  channelName?: string;
}

export interface CreateOpportunityThreadParams {
  opportunityId: string;
  posterId: string;
  interestedUserId: string;
}

export interface SendMessageParams {
  content: string;
  contentType?: MessageContentType;
  media?: MessageMedia[];
  replyToMessageId?: string;
  crossCReferences?: CrossCReference[];
}

export interface GetConversationsParams {
  filter: ConversationFilter;
  cursor: string | null;
  limit?: number;
}

export interface GetMessagesParams {
  conversationId: string;
  cursor: string | null;
  limit?: number;
}

// ============================================================
// REAL-TIME SUBSCRIPTION CALLBACKS
// ============================================================

export interface ConversationSubscriptionCallbacks {
  onMessage: (message: Message) => void;
  onTyping: (indicator: TypingIndicator) => void;
  onReadReceipt: (data: { userId: string; lastReadMessageId: string }) => void;
  onReaction: (data: { messageId: string; userId: string; emoji: string }) => void;
}

export interface ConversationListUpdatePayload {
  conversationId: string;
  lastMessage: Partial<Message>;
}

// ============================================================
// TIER CONFIGURATION
// ============================================================

export interface MessagingTierConfig {
  maxGroupParticipants: number;
  spaceChannelAccess: 'join' | 'create_moderate' | 'admin_analytics';
  voiceNoteMaxSeconds: number;
  mediaSizeLimitMb: number;
  messageSearchWindow: 'last_30_days' | 'unlimited';
  diaSmartReplies: boolean;
  conversationSummaries: boolean;
  readReceipts: 'direct_only' | 'all' | 'all_with_delivery';
  messageEditWindowMinutes: number;
  customReactions: boolean;
}

export const MESSAGING_TIER_CONFIG: Record<string, MessagingTierConfig> = {
  free: {
    maxGroupParticipants: 10,
    spaceChannelAccess: 'join',
    voiceNoteMaxSeconds: 30,
    mediaSizeLimitMb: 5,
    messageSearchWindow: 'last_30_days',
    diaSmartReplies: false,
    conversationSummaries: false,
    readReceipts: 'direct_only',
    messageEditWindowMinutes: 0,
    customReactions: false,
  },
  pro: {
    maxGroupParticipants: 50,
    spaceChannelAccess: 'create_moderate',
    voiceNoteMaxSeconds: 120,
    mediaSizeLimitMb: 25,
    messageSearchWindow: 'unlimited',
    diaSmartReplies: true,
    conversationSummaries: false,
    readReceipts: 'all',
    messageEditWindowMinutes: 15,
    customReactions: true,
  },
  org: {
    maxGroupParticipants: 200,
    spaceChannelAccess: 'admin_analytics',
    voiceNoteMaxSeconds: 300,
    mediaSizeLimitMb: 100,
    messageSearchWindow: 'unlimited',
    diaSmartReplies: true,
    conversationSummaries: true,
    readReceipts: 'all_with_delivery',
    messageEditWindowMinutes: 60,
    customReactions: true,
  },
};

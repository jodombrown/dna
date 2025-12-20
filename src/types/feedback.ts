// ============================================
// DNA FEEDBACK HUB TYPES
// ============================================

export type UserTag = 'bug' | 'suggestion' | 'question' | 'praise' | 'other';
export type AdminCategory = 'bug' | 'feature_request' | 'ux_issue' | 'question' | 'duplicate' | 'other';
export type AdminStatus = 'open' | 'in_progress' | 'resolved' | 'wont_fix';
export type AdminPriority = 'low' | 'medium' | 'high' | 'critical';
export type ContentType = 'text' | 'image' | 'voice' | 'video' | 'mixed';
export type AttachmentType = 'image' | 'voice' | 'video';
export type FeedbackEmoji = '👍' | '❤️' | '🔥' | '👀' | '✅';
export type MembershipStatus = 'active' | 'opted_out' | 'muted';

export const FEEDBACK_EMOJIS: FeedbackEmoji[] = ['👍', '❤️', '🔥', '👀', '✅'];

export const USER_TAG_LABELS: Record<UserTag, string> = {
  bug: 'Bug',
  suggestion: 'Suggestion',
  question: 'Question',
  praise: 'Praise',
  other: 'Other',
};

export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: "Won't Fix",
};

export const ADMIN_STATUS_COLORS: Record<AdminStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  wont_fix: 'bg-gray-100 text-gray-800',
};

export const ADMIN_PRIORITY_LABELS: Record<AdminPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const ADMIN_PRIORITY_COLORS: Record<AdminPriority, string> = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

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
}

export interface FeedbackMessageWithSender extends FeedbackMessage {
  sender: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
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
  emoji: FeedbackEmoji;
  created_at: string;
}

export interface ReactionCount {
  count: number;
  users: string[];
  reacted_by_me: boolean;
}

export interface ReactionSummary {
  [emoji: string]: ReactionCount;
}

export interface PaginatedMessages {
  messages: FeedbackMessageWithSender[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SendMessageParams {
  channelId: string;
  content: string;
  contentType?: ContentType;
  userTag?: UserTag;
  parentMessageId?: string;
}

export interface FeedbackAnalytics {
  total_messages: number;
  by_status: Record<AdminStatus, number>;
  by_category: Record<AdminCategory, number>;
  by_user_tag: Record<UserTag, number>;
  resolution_rate: number;
  avg_resolution_time_hours: number;
  trending_issues: FeedbackMessageWithSender[];
  top_contributors: { user_id: string; count: number; profile: { username: string | null; full_name: string | null; avatar_url: string | null } }[];
  messages_over_time: { date: string; count: number }[];
}

export type FeedbackFilter = 'all' | 'pinned' | 'my_feedback';
export type StatusFilter = AdminStatus | 'all';
export type TagFilter = UserTag | 'all';

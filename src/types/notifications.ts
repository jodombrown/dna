export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'post_like'
  | 'post_comment'
  | 'comment_reply'
  | 'mention'
  | 'new_message'
  | 'event_invite'
  | 'event_reminder'
  | 'group_invite'
  | 'system';

export interface Notification {
  notification_id: string;
  actor_id: string | null;
  actor_username: string | null;
  actor_full_name: string | null;
  actor_avatar_url: string | null;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  connection_requests: boolean;
  connection_accepted: boolean;
  post_likes: boolean;
  post_comments: boolean;
  mentions: boolean;
  messages: boolean;
  email_connection_requests: boolean;
  email_connection_accepted: boolean;
  email_post_interactions: boolean;
  email_messages: boolean;
  email_digest_frequency: 'never' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

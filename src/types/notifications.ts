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
  | 'profile_view'
  | 'reaction'
  | 'reshare'
  | 'feedback_status_change'
  | 'system';

export interface Notification {
  notification_id: string;
  actor_id?: string;
  actor_username?: string;
  actor_full_name?: string;
  actor_avatar_url?: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  payload?: Record<string, any>;
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

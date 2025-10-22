export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface ConversationListItem {
  conversation_id: string;
  other_user_id: string;
  other_user_username: string;
  other_user_full_name: string;
  other_user_avatar_url?: string;
  other_user_headline?: string;
  last_message_content?: string;
  last_message_sender_id?: string;
  last_message_at: string;
  unread_count: number;
}

export interface MessageWithSender {
  message_id: string;
  sender_id: string;
  sender_username: string;
  sender_full_name: string;
  sender_avatar_url?: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

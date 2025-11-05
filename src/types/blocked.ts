export interface BlockedUser {
  block_id: string;
  blocked_user_id: string;
  blocked_username: string;
  blocked_full_name: string;
  blocked_avatar_url?: string;
  reason?: string;
  blocked_at: string;
}

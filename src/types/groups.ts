export type GroupPrivacy = 'public' | 'private' | 'secret';
export type GroupMemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type GroupJoinPolicy = 'open' | 'approval_required' | 'invite_only';

export interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  cover_image_url?: string;
  privacy: GroupPrivacy;
  join_policy: GroupJoinPolicy;
  category?: string;
  location?: string;
  tags?: string[];
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupListItem {
  group_id: string;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  cover_image_url?: string;
  privacy: GroupPrivacy;
  join_policy: GroupJoinPolicy;
  category?: string;
  location?: string;
  member_count: number;
  post_count: number;
  created_at: string;
  is_member: boolean;
  user_role?: GroupMemberRole;
}

export interface GroupDetails {
  group_id: string;
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  cover_image_url?: string;
  privacy: GroupPrivacy;
  join_policy: GroupJoinPolicy;
  category?: string;
  location?: string;
  tags?: string[];
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_member: boolean;
  user_role?: GroupMemberRole;
  can_post: boolean;
}

export interface GroupMember {
  member_id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  role: GroupMemberRole;
  joined_at: string;
}

export interface GroupPost {
  post_id: string;
  author_id: string;
  author_username: string;
  author_full_name: string;
  author_avatar_url?: string;
  content: string;
  image_urls?: string[];
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  user_has_liked: boolean;
}

export interface GroupPostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_username: string;
  author_full_name: string;
  author_avatar_url?: string;
  content: string;
  created_at: string;
}

export interface CreateGroupInput {
  name: string;
  slug: string;
  description?: string;
  privacy: GroupPrivacy;
  join_policy: GroupJoinPolicy;
  category?: string;
  location?: string;
  tags?: string[];
}

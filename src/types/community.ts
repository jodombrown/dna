
export interface Community {
  id: string;
  name: string;
  created_by: string | null;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
  member_count: number | null;
  is_featured: boolean | null;
  moderation_status: string | null;
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  moderator_notes: string | null;
  rejection_reason: string | null;
}

export interface CommunityMembership {
  id: string;
  user_id: string;
  community_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface CommunityWithMembership extends Community {
  user_membership?: CommunityMembership;
  is_member: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
}

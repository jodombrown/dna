
export interface Community {
  id: string;
  name: string;
  creator_id: string;
  description?: string | null;
  purpose_goals?: string | null;
  category?: string | null;
  tags?: string[] | null;
  cover_image_url?: string | null;
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  purpose_goals?: string;
  category?: string;
  tags?: string[];
  cover_image_url?: string;
}

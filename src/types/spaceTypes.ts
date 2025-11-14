export type SpaceType = 'project' | 'working_group' | 'initiative' | 'program';
export type SpaceStatus = 'idea' | 'active' | 'completed' | 'paused';
export type SpaceVisibility = 'public' | 'invite_only';
export type SpaceMemberRole = 'lead' | 'core_contributor' | 'contributor';

export interface Space {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  space_type: SpaceType;
  status: SpaceStatus;
  visibility: SpaceVisibility;
  focus_areas: string[];
  region?: string;
  created_by: string;
  origin_event_id?: string;
  origin_group_id?: string;
  external_link?: string;
  created_at: string;
  updated_at: string;
}

export interface SpaceMember {
  space_id: string;
  user_id: string;
  role: SpaceMemberRole;
  joined_at: string;
}

export interface SpaceWithMembership extends Space {
  user_role?: SpaceMemberRole;
  member_count?: number;
}

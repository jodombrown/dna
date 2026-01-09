// src/types/collaborate.ts
// DNA COLLABORATE Phase 1: TypeScript Types

export type PrivacyLevel = 'public' | 'private' | 'invite_only';
export type SpaceStatus = 'idea' | 'active' | 'completed' | 'paused' | 'archived' | 'stalled';
export type SourceType = 'event' | 'content' | 'marketplace' | 'organic';
export type InitiativeStatus = 'planning' | 'active' | 'completed' | 'abandoned';
export type MilestoneStatus = 'pending' | 'completed' | 'missed';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NudgeType = 'automated' | 'manual' | 'escalation';
export type NudgeTone = 'gentle' | 'checkin' | 'urgent';
export type TemplateCategory = 'professional' | 'community' | 'investment' | 'learning' | 'advocacy';
export type MemberStatus = 'active' | 'invited' | 'removed';
export type SpaceType = 'project' | 'working_group' | 'initiative' | 'program';

export interface RolePermissions {
  can_edit_space: boolean;
  can_invite_members: boolean;
  can_create_initiatives: boolean;
  can_assign_tasks: boolean;
  can_send_nudges: boolean;
  can_manage_roles: boolean;
}

export interface DefaultRole {
  title: string;
  description: string;
  is_lead: boolean;
  permissions: RolePermissions;
}

export interface DefaultInitiative {
  title: string;
  description: string;
}

export interface SuggestedMilestone {
  title: string;
}

export interface SpaceTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: TemplateCategory;
  default_roles: DefaultRole[];
  default_initiatives: DefaultInitiative[];
  suggested_milestones: SuggestedMilestone[];
  tier_availability: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollaborateSpace {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_image_url: string | null;
  space_type: SpaceType;
  template_id: string | null;
  privacy_level: PrivacyLevel;
  visibility: 'public' | 'invite_only';
  status: SpaceStatus;
  source_type: SourceType | null;
  source_id: string | null;
  completion_summary: Record<string, unknown> | null;
  last_activity_at: string;
  stall_threshold_days: number;
  focus_areas: string[];
  region: string | null;
  external_link: string | null;
  origin_event_id: string | null;
  origin_group_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  template?: SpaceTemplate;
  member_count?: number;
  initiative_count?: number;
}

export interface SpaceMember {
  id?: string;
  space_id: string;
  user_id: string;
  role: 'lead' | 'core_contributor' | 'contributor';
  role_id: string | null;
  status: MemberStatus;
  joined_at: string;
  invited_by: string | null;
  // Joined fields
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    username?: string | null;
  };
  space_role?: SpaceRole;
}

export interface SpaceRole {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  required_skills: string[] | null;
  permissions: RolePermissions;
  is_lead: boolean;
  order_index: number;
  created_at: string;
}

export interface Initiative {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  status: InitiativeStatus;
  target_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  completion_metrics: Record<string, unknown> | null;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  milestones?: Milestone[];
  tasks?: CollaborateTask[];
  task_count?: number;
  completed_task_count?: number;
}

export interface Milestone {
  id: string;
  initiative_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: MilestoneStatus;
  completion_date: string | null;
  celebration_shared: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CollaborateTask {
  id: string;
  space_id: string;
  initiative_id: string | null;
  milestone_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  nudge_count: number;
  last_nudge_at: string | null;
  order_index: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    username?: string | null;
  };
  space?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CollaborateNudge {
  id: string;
  space_id: string;
  task_id: string | null;
  target_user_id: string;
  sent_by: string | null;
  type: NudgeType;
  tone: NudgeTone;
  message: string;
  sent_at: string;
  acknowledged_at: string | null;
  created_at: string;
  // Joined fields
  task?: CollaborateTask;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface SpaceActivityLog {
  id: string;
  space_id: string;
  user_id: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Joined fields
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

// Form types for creation
export interface CreateSpaceInput {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  space_type?: SpaceType;
  template_id?: string;
  privacy_level?: PrivacyLevel;
  visibility?: 'public' | 'invite_only';
  cover_image_url?: string;
  source_type?: SourceType;
  source_id?: string;
  focus_areas?: string[];
  region?: string;
}

export interface CreateInitiativeInput {
  space_id: string;
  title: string;
  description?: string;
  target_date?: string;
}

export interface CreateMilestoneInput {
  initiative_id: string;
  title: string;
  description?: string;
  target_date?: string;
}

export interface CreateTaskInput {
  space_id: string;
  initiative_id?: string;
  milestone_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  assigned_to?: string;
}

export interface SendNudgeInput {
  space_id: string;
  task_id?: string;
  target_user_id: string;
  type?: NudgeType;
  tone?: NudgeTone;
  message: string;
}

export interface CreateRoleInput {
  space_id: string;
  title: string;
  description?: string;
  required_skills?: string[];
  permissions?: Partial<RolePermissions>;
  is_lead?: boolean;
  order_index?: number;
}

// Filter types
export interface SpaceFilters {
  category?: TemplateCategory;
  status?: SpaceStatus;
  privacy_level?: PrivacyLevel;
  hasOpenRoles?: boolean;
  search?: string;
}

export interface TaskFilters {
  initiative_id?: string;
  milestone_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  overdue?: boolean;
}

// Statistics types
export interface SpaceStats {
  total_members: number;
  active_initiatives: number;
  completed_initiatives: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
}

export interface UserCollaborateStats {
  spaces_leading: number;
  spaces_contributing: number;
  tasks_assigned: number;
  tasks_completed: number;
  unread_nudges: number;
}

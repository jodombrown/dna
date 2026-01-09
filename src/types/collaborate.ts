export type PrivacyLevel = 'public' | 'private' | 'invite_only';

export interface SpaceTemplateRole {
  title: string;
  description?: string;
  is_lead?: boolean;
  permissions?: string[];
}

export interface SpaceTemplateInitiative {
  title: string;
  description?: string;
  priority?: string;
}

export interface SpaceTemplateMilestone {
  title: string;
  description?: string;
  due_offset_days?: number;
}

export interface SpaceTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  default_roles: SpaceTemplateRole[] | null;
  default_initiatives: SpaceTemplateInitiative[] | null;
  suggested_milestones: SpaceTemplateMilestone[] | null;
  tier_availability: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSpaceInput {
  name: string;
  description?: string;
  privacy_level?: PrivacyLevel;
  source_type?: 'event' | 'content' | 'marketplace' | 'organic';
  source_id?: string;
}

export interface CreateSpaceFromTemplateInput extends CreateSpaceInput {
  templateId: string;
}

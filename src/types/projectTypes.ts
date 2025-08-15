export interface Project {
  id: string;
  title: string;
  description?: string;
  impact_area?: string;
  status?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export interface ProjectContribution {
  id: string;
  project_id: string;
  contributor_id: string;
  contribution_type: string;
  time_commitment?: string;
  skills_offered?: string[];
  funding_interest?: number;
  message?: string;
  status: string;
  created_at: string;
  contributor?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export interface ProjectFormData {
  title: string;
  description: string;
  impact_area: string;
  timeline?: string;
  skills_needed?: string[];
  funding_goal?: number;
}

export interface ContributionFormData {
  contribution_type: 'interest' | 'time' | 'skills' | 'funding';
  time_commitment?: string;
  skills_offered?: string[];
  funding_interest?: number;
  message: string;
}
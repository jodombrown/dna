
export interface CollaborationProject {
  id: string;
  title: string;
  description: string;
  impact_area: string;
  region: string;
  countries: string[];
  contribution_types: ContributionType[];
  skills_needed: string[];
  team_size: number;
  collaborators: number;
  funding_goal?: number;
  current_funding?: number;
  progress: number;
  status: 'active' | 'launching' | 'scaling' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  time_commitment: 'flexible' | 'part-time' | 'full-time';
  creator: {
    name: string;
    avatar?: string;
    title?: string;
  };
  tags: string[];
  timeline: string;
  next_milestone?: string;
  recent_update?: string;
  image_url?: string;
  created_at: string;
}

export type ContributionType = 
  | 'funding' 
  | 'technical-skills' 
  | 'business-expertise' 
  | 'mentorship' 
  | 'network' 
  | 'marketing' 
  | 'operations' 
  | 'research';

export type ImpactArea = 
  | 'healthtech' 
  | 'fintech' 
  | 'agritech' 
  | 'edtech' 
  | 'cleantech' 
  | 'infrastructure' 
  | 'creative-economy' 
  | 'governance';

export type AfricanRegion = 
  | 'west-africa' 
  | 'east-africa' 
  | 'north-africa' 
  | 'central-africa' 
  | 'southern-africa' 
  | 'pan-african';

export interface CollaborationFilters {
  impact_area: ImpactArea[];
  region: AfricanRegion[];
  contribution_types: ContributionType[];
  skills: string[];
  time_commitment: string[];
  funding_range: [number, number] | null;
  urgency: string[];
  search_query: string;
}

export interface CollaborationStats {
  total_projects: number;
  active_collaborators: number;
  countries_involved: number;
  total_funding: string;
  impact_stories: number;
}

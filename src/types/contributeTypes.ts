export type ContributionNeedType = 'funding' | 'skills' | 'time' | 'access' | 'resources';
export type ContributionNeedStatus = 'open' | 'in_progress' | 'fulfilled' | 'closed';
export type ContributionNeedPriority = 'normal' | 'high';

export interface ContributionNeed {
  id: string;
  space_id: string;
  created_by: string;
  type: ContributionNeedType;
  title: string;
  description: string;
  status: ContributionNeedStatus;
  priority: ContributionNeedPriority;
  focus_areas?: string[];
  region?: string;
  target_amount?: number;
  currency?: string;
  time_commitment?: string;
  duration?: string;
  needed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContributionNeedWithSpace extends ContributionNeed {
  space?: {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    focus_areas?: string[];
    region?: string;
  };
}

export interface Project {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  impact_area: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: string;
  user_id: string;
  type: 'post' | 'initiative' | 'event' | 'opportunity' | 'community' | 'newsletter';
  target_id: string;
  target_title: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export type ContributionAction = 'mentor' | 'join' | 'fund' | 'support';

export interface ContributionModalData {
  project: Project;
  action: ContributionAction;
}
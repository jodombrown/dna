
export interface Contribution {
  id: string;
  user_id: string;
  type: 'post' | 'initiative' | 'event' | 'opportunity' | 'community' | 'newsletter';
  target_id: string;
  target_title: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

export type ContributionType = Contribution['type'];

export interface ContributionTrackingData {
  type: ContributionType;
  targetId: string;
  targetTitle?: string;
  metadata?: Record<string, any>;
}

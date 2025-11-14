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
  offer_count?: number;
}

export type ContributionOfferStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'validated';

export interface ContributionOffer {
  id: string;
  need_id: string;
  space_id: string;
  created_by: string;
  message: string;
  offered_amount?: number;
  offered_currency?: string;
  status: ContributionOfferStatus;
  created_at: string;
  updated_at: string;
}

export interface ContributionOfferWithDetails extends ContributionOffer {
  need?: {
    id: string;
    title: string;
    type: ContributionNeedType;
  };
  space?: {
    id: string;
    name: string;
    slug: string;
  };
  contributor?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
  };
}

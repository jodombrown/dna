export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  applicant_id: string;
  cover_letter: string | null;
  proposed_contribution_type: string;
  proposed_hours_per_month: number | null;
  status: ApplicationStatus;
  review_notes: string | null;
  poster_notes: string | null;
  created_at: string;
  updated_at: string;
  status_updated_at: string | null;
  withdrawn_at: string | null;
  applicant_name: string;
  applicant_avatar: string | null;
  applicant_headline: string | null;
  applicant_username: string | null;
}

export type FulfillmentStatus = 'in_progress' | 'submitted' | 'revision_requested' | 'completed' | 'cancelled';

export interface ContributionFulfillment {
  id: string;
  opportunity_id: string;
  contributor_id: string;
  poster_id: string;
  status: FulfillmentStatus;
  submission_notes: string | null;
  submission_attachments: Array<{ url: string; name: string; type: string }>;
  revision_notes: string | null;
  completion_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributionAcknowledgment {
  id: string;
  fulfillment_id: string;
  from_profile_id: string;
  to_profile_id: string;
  message: string;
  rating: number | null;
  is_public: boolean;
  created_at: string;
  from_name: string;
  from_avatar: string | null;
  from_username: string | null;
  opportunity_title: string;
}

export interface ContributionHistoryItem {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  contributor_id: string;
  contributor_name: string;
  contributor_avatar: string | null;
  poster_id: string;
  poster_name: string;
  poster_avatar: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  has_acknowledgment: boolean;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referral_code: string;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LaunchConfig {
  id: string;
  launch_mode: 'soft_launch' | 'open_access';
  launch_date: string | null;
  max_invites: number;
  current_invites: number;
  updated_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  converted_referrals: number;
  pending_referrals: number;
  conversion_rate: number;
}
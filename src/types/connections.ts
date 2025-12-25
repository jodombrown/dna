export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined' | 'blocked';

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  professional_role?: string;
  connected_at?: string;
}

export interface ConnectionRequest extends ConnectionProfile {
  connection_id: string;
  requester_id: string;
  message?: string;
  created_at: string;
}

export interface MutualConnection {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
}

export interface ConnectionRecommendation {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  profession?: string;
  match_score: number;
  shared_skills_count: number;
  shared_interests_count: number;
  mutual_connections_count: number;
  same_heritage: boolean;
  same_region: boolean;
  match_reasons: string[];
}

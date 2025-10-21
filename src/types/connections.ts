export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  a: string;
  b: string;
  status: 'accepted';
  created_at: string;
  last_interaction_at?: string;
  adin_health: number;
  adin_health_reason?: string;
  connection_note?: string;
}

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
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

export interface MutualConnection {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
}

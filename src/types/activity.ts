// Activity types for the multi-C feed

export type ActivityType = 'post' | 'connection' | 'space' | 'event' | 'contribution' | 'story';

export interface Activity {
  activity_id: string;
  activity_type: ActivityType;
  created_at: string;
  actor_id: string;
  actor_username: string;
  actor_full_name: string;
  actor_avatar_url?: string;
  entity_id: string;
  entity_type: string;
  entity_title: string;
  entity_data: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ActivityFeedFilters {
  types?: ActivityType[];
}

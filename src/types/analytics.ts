export interface ProfileViewer {
  viewer_id: string;
  viewer_username: string;
  viewer_full_name: string;
  viewer_avatar_url?: string;
  viewer_headline?: string;
  view_count: number;
  last_viewed_at: string;
  is_connected: boolean;
}

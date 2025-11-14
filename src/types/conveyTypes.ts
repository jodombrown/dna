export type ConveyItemType = 'story' | 'update' | 'impact';
export type ConveyItemStatus = 'draft' | 'published' | 'archived';
export type ConveyItemVisibility = 'public' | 'members_only' | 'space_members_only';

export interface ConveyItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  type: ConveyItemType;
  status: ConveyItemStatus;
  visibility: ConveyItemVisibility;
  body: string;
  author_id: string;
  primary_space_id: string | null;
  primary_event_id: string | null;
  primary_need_id: string | null;
  primary_offer_id: string | null;
  primary_badge_id: string | null;
  focus_areas: string[] | null;
  region: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ConveyItemWithDetails extends ConveyItem {
  author?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  primary_space?: {
    id: string;
    name: string;
    tagline: string | null;
    slug: string;
  };
}

export interface ConveyFilters {
  type?: ConveyItemType;
  region?: string;
  focusAreas?: string[];
  onlyMySpaces?: boolean;
}

export interface ConveyItemTag {
  id: string;
  convey_item_id: string;
  tag: string;
  created_at: string;
}

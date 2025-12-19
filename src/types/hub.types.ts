export type HubType = 'region' | 'country';
export type FeedType = 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';

export interface HubMetadata {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description_short: string;
  description_full?: string;
  hero_image_url: string;
  key_sectors?: string[];
  diaspora_population_estimate?: number;
  countries?: CountryCard[];
}

export interface CountryCard {
  id: string;
  name: string;
  slug: string;
  flag_url: string;
  population?: number;
  tagline?: string;
}

export interface HubMetrics {
  members_connected: number;
  events_hosted: number;
  projects_active: number;
  contributions_total: number;
  stories_published: number;
  connections_made?: number;
}

export interface MemberCard {
  id: string;
  display_name: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  expertise_areas?: string[];
  interests?: string[];
}

export interface EventCard {
  id: string;
  title: string;
  slug: string;
  event_type: string;
  start_datetime: string;
  location_name: string;
  cover_image_url?: string;
  attendee_count: number;
}

export interface ProjectCard {
  id: string;
  title: string;
  slug: string;
  sector: string;
  stage: string;
  description_short: string;
  seeking_roles: string[];
  team_size: number;
}

export interface OpportunityCard {
  id: string;
  title: string;
  slug: string;
  type: string;
  description_short: string;
  sector?: string;
  budget_range?: string;
  deadline?: string;
}

export interface ContentCard {
  id: string;
  excerpt: string;
  published_at: string;
  author_id: string;
  engagement: {
    likes: number;
    comments: number;
  };
}

export interface FeedData<T> {
  items: T[];
  total: number;
  has_more: boolean;
}

export interface HubData {
  success: boolean;
  timestamp: string;
  cache_status: 'hit' | 'miss' | 'stale';
  personalization_tier: number;
  hub: {
    metadata?: HubMetadata;
    metrics?: HubMetrics;
  };
  feeds: {
    connect?: FeedData<MemberCard>;
    convene?: FeedData<EventCard>;
    collaborate?: FeedData<ProjectCard>;
    contribute?: FeedData<OpportunityCard>;
    convey?: FeedData<ContentCard>;
  };
}

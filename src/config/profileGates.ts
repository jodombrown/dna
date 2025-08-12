export const FEATURE_GATES = {
  post_create: ['avatar_url', 'headline', 'current_city', 'current_country_code'],
  connection_request: ['avatar_url', 'headline', 'interests'],
  event_create: ['avatar_url', 'headline', 'current_city', 'current_country_code', 'org_link_or_name'],
  project_create: ['avatar_url', 'headline', 'skills', 'interests', 'current_country_code'],
  messaging: ['avatar_url', 'headline', 'skills'],
} as const;

export type FeatureKey = keyof typeof FEATURE_GATES;

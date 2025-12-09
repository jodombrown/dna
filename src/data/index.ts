/**
 * Data Constants Index
 * Re-exports all data constants from a single location
 */

// Countries
export { COUNTRIES } from './countries';

// Languages
export { LANGUAGES, type Language } from './languages';

// Profile Options
export {
  // Sectors
  SECTOR_OPTIONS,
  type Sector,

  // Intentions
  INTENTION_OPTIONS,
  INTENTION_VALUES,
  type IntentionValue,

  // Diaspora Status
  DIASPORA_STATUS_OPTIONS,
  DIASPORA_STATUS_VALUES,
  type DiasporaStatusValue,

  // Engagement Intentions
  ENGAGEMENT_INTENTION_OPTIONS,
  ENGAGEMENT_INTENTION_VALUES,
  type EngagementIntentionValue,

  // Available For
  AVAILABLE_FOR_OPTIONS,
  AVAILABLE_FOR_VALUES,
  type AvailableForValue,

  // Mentorship Areas
  MENTORSHIP_AREA_OPTIONS,
  type MentorshipArea,

  // Skills
  COMMON_SKILLS,
  type CommonSkill,

  // Interests
  COMMON_INTERESTS,
  type CommonInterest,

  // Diaspora Networks
  DIASPORA_NETWORK_OPTIONS,
  type DiasporaNetwork,

  // User Types
  USER_TYPE_OPTIONS,
  USER_TYPE_VALUES,
  type UserTypeValue,
} from './profileOptions';

// Re-export discovery tags from lib/constants for convenience
export {
  FOCUS_AREAS,
  REGIONAL_EXPERTISE,
  INDUSTRIES,
  type FocusArea,
  type RegionalExpertise,
  type Industry,
} from '@/lib/constants/discoveryTags';

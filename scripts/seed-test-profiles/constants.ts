/**
 * DNA Platform - Test Profile Constants
 *
 * Centralized constants for seeded test profiles
 */

// Test Profile IDs (UUIDs for consistent references)
export const TEST_PROFILE_IDS = {
  AMARA_FINTECH: 'test-profile-001-amara-fintech',
  KWAME_ENERGY: 'test-profile-002-kwame-energy',
  FATIMA_CULTURE: 'test-profile-003-fatima-culture',
  DAVID_HEALTH: 'test-profile-004-david-health',
  ZARA_EDUCATION: 'test-profile-005-zara-education',
} as const;

// Test email domain
export const TEST_EMAIL_DOMAIN = '@dna-platform.test';

// Test ID prefix
export const TEST_PROFILE_PREFIX = 'test-profile-';

// Export type for profile IDs
export type TestProfileId = typeof TEST_PROFILE_IDS[keyof typeof TEST_PROFILE_IDS];

/**
 * Feature Tour Components
 *
 * This module provides reusable tour components for onboarding users
 * to different features across the DNA platform.
 */

export { FeatureTour } from './FeatureTour';
export type { TourStep, FeatureTourProps } from './FeatureTour';

export { FeedbackHubTour } from './FeedbackHubTour';

// Re-export hook and types for convenience
export { useFeatureTour, FEATURE_TOUR_IDS } from '@/hooks/useFeatureTour';
export type { FeatureTourId } from '@/hooks/useFeatureTour';

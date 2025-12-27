import { useCallback, useState } from 'react';

/**
 * Feature Tour IDs - centralized registry of all feature tours
 * Add new feature tours here as the system expands
 */
export const FEATURE_TOUR_IDS = {
  FEEDBACK_HUB: 'feedback-hub',
  CONNECT: 'connect',
  CONVENE: 'convene',
  CONTRIBUTE: 'contribute',
  CONVEY: 'convey',
  PROFILE: 'profile',
} as const;

export type FeatureTourId = typeof FEATURE_TOUR_IDS[keyof typeof FEATURE_TOUR_IDS];

interface FeatureTourProgress {
  completedAt: string | null;
  currentStep: number;
  lastShownAt: string | null;
}

type FeatureToursState = Record<string, FeatureTourProgress>;

const STORAGE_KEY = 'dna-feature-tours';

/**
 * Get feature tours state from localStorage
 */
function getLocalTours(): FeatureToursState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save feature tours state to localStorage
 */
function setLocalTours(state: FeatureToursState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently fail on storage errors
  }
}

/**
 * Hook to manage feature-specific tour progress (localStorage only)
 *
 * Usage:
 * ```tsx
 * const { hasCompleted, markComplete, reset, currentStep, updateStep } = useFeatureTour('feedback-hub');
 * ```
 */
export function useFeatureTour(featureId: FeatureTourId) {
  // Local state for immediate UI updates
  const [localState, setLocalState] = useState<FeatureTourProgress>(() => {
    const tours = getLocalTours();
    return tours[featureId] || { completedAt: null, currentStep: 0, lastShownAt: null };
  });

  // Helper to update local state
  const updateState = useCallback((updates: Partial<FeatureTourProgress>) => {
    setLocalState(prev => {
      const newState = { ...prev, ...updates };
      // Update localStorage
      const tours = getLocalTours();
      tours[featureId] = newState;
      setLocalTours(tours);
      return newState;
    });
  }, [featureId]);

  const hasCompleted = !!localState.completedAt;
  const shouldShowTour = !hasCompleted;
  const currentStep = localState.currentStep;

  /**
   * Mark tour as shown (first time opened)
   */
  const markShown = useCallback(() => {
    if (!localState.lastShownAt) {
      updateState({ lastShownAt: new Date().toISOString() });
    }
  }, [localState.lastShownAt, updateState]);

  /**
   * Update current step (for resume functionality)
   */
  const updateStep = useCallback((step: number) => {
    updateState({ currentStep: step });
  }, [updateState]);

  /**
   * Mark tour as completed
   */
  const markComplete = useCallback(() => {
    updateState({
      completedAt: new Date().toISOString(),
      currentStep: 0,
    });
  }, [updateState]);

  /**
   * Reset tour (for re-taking)
   */
  const reset = useCallback(() => {
    updateState({
      completedAt: null,
      currentStep: 0,
      lastShownAt: null,
    });
  }, [updateState]);

  return {
    hasCompleted,
    shouldShowTour,
    currentStep,
    markShown,
    updateStep,
    markComplete,
    reset,
    isUpdating: false,
  };
}

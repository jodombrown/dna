import { useCallback, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
 * Hook to manage feature-specific tour progress
 *
 * Usage:
 * ```tsx
 * const { hasCompleted, markComplete, reset, currentStep, updateStep } = useFeatureTour('feedback-hub');
 * ```
 */
export function useFeatureTour(featureId: FeatureTourId) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Local state for immediate UI updates
  const [localState, setLocalState] = useState<FeatureTourProgress>(() => {
    const tours = getLocalTours();
    return tours[featureId] || { completedAt: null, currentStep: 0, lastShownAt: null };
  });

  // Sync from profile on mount (if available)
  useEffect(() => {
    if (profile) {
      const profileTours = (profile as any)?.feature_tours_completed as FeatureToursState | undefined;
      if (profileTours && profileTours[featureId]) {
        const serverState = profileTours[featureId];
        // Server state takes precedence if it has completion data
        if (serverState.completedAt || (!localState.completedAt && serverState.currentStep > localState.currentStep)) {
          setLocalState(serverState);
          // Also update localStorage to stay in sync
          const tours = getLocalTours();
          tours[featureId] = serverState;
          setLocalTours(tours);
        }
      }
    }
  }, [profile, featureId]);

  // Mutation to persist to server
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<FeatureTourProgress>) => {
      if (!user) return; // Don't persist for unauthenticated users

      // Get current server state
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('feature_tours_completed')
        .eq('id', user.id)
        .single();

      const currentTours = (currentProfile?.feature_tours_completed as FeatureToursState) || {};
      const currentFeatureState = currentTours[featureId] || { completedAt: null, currentStep: 0, lastShownAt: null };

      const updatedTours: FeatureToursState = {
        ...currentTours,
        [featureId]: {
          ...currentFeatureState,
          ...updates,
        },
      };

      const { error } = await supabase
        .from('profiles')
        .update({ feature_tours_completed: updatedTours })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
    },
  });

  // Helper to update both local and server state
  const updateState = useCallback((updates: Partial<FeatureTourProgress>) => {
    // Update local state immediately
    setLocalState(prev => {
      const newState = { ...prev, ...updates };
      // Update localStorage
      const tours = getLocalTours();
      tours[featureId] = newState;
      setLocalTours(tours);
      return newState;
    });

    // Persist to server (fire-and-forget)
    updateMutation.mutate(updates);
  }, [featureId, updateMutation]);

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
      currentStep: 0, // Reset step for potential re-take
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
    isUpdating: updateMutation.isPending,
  };
}

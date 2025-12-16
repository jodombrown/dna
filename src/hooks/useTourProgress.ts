import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TourProgress {
  tour_completed_at: string | null;
  tour_skipped_at: string | null;
  tour_current_step: number;
  tour_last_shown_at: string | null;
}

export function useTourProgress() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Get tour progress from profile
  const tourProgress: TourProgress = {
    tour_completed_at: (profile as any)?.tour_completed_at || null,
    tour_skipped_at: (profile as any)?.tour_skipped_at || null,
    tour_current_step: (profile as any)?.tour_current_step || 0,
    tour_last_shown_at: (profile as any)?.tour_last_shown_at || null,
  };

  const isCompleted = !!tourProgress.tour_completed_at;
  const wasSkipped = !!tourProgress.tour_skipped_at;
  // Only show tour if: not completed, not skipped, and never shown before
  const shouldShowTour = !isCompleted && !wasSkipped && !tourProgress.tour_last_shown_at;

  // Update tour progress mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<TourProgress>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
    },
  });

  // Mark tour as started (first time shown)
  const markTourShown = useCallback(() => {
    if (!tourProgress.tour_last_shown_at) {
      updateMutation.mutate({
        tour_last_shown_at: new Date().toISOString(),
      });
    }
  }, [tourProgress.tour_last_shown_at, updateMutation]);

  // Update current step (for resume)
  const updateStep = useCallback((step: number) => {
    updateMutation.mutate({
      tour_current_step: step,
    });
  }, [updateMutation]);

  // Mark tour as skipped
  const skipTour = useCallback(() => {
    updateMutation.mutate({
      tour_skipped_at: new Date().toISOString(),
    });
  }, [updateMutation]);

  // Mark tour as completed
  const completeTour = useCallback(() => {
    updateMutation.mutate({
      tour_completed_at: new Date().toISOString(),
      tour_skipped_at: null, // Clear skipped flag if completing
      tour_current_step: 0, // Reset step
    });
  }, [updateMutation]);

  // Reset tour (for re-taking)
  const resetTour = useCallback(() => {
    updateMutation.mutate({
      tour_completed_at: null,
      tour_skipped_at: null,
      tour_current_step: 0,
      tour_last_shown_at: null,
    });
  }, [updateMutation]);

  return {
    tourProgress,
    isCompleted,
    wasSkipped,
    shouldShowTour,
    currentStep: tourProgress.tour_current_step,
    markTourShown,
    updateStep,
    skipTour,
    completeTour,
    resetTour,
    isUpdating: updateMutation.isPending,
  };
}

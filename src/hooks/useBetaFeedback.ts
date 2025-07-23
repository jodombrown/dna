import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BetaFeedback {
  id: string;
  user_id: string;
  feature_name: string;
  feedback_type: 'prompt_response' | 'bug_report' | 'suggestion' | 'completion';
  rating?: number;
  feedback_text?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BetaFeedbackSubmission {
  featureName: string;
  feedbackType: 'prompt_response' | 'bug_report' | 'suggestion' | 'completion';
  rating: number;
  feedbackText: string;
  metadata?: Record<string, any>;
}

export const useBetaFeedback = () => {
  const queryClient = useQueryClient();

  const submitFeedback = useMutation({
    mutationFn: async (feedback: BetaFeedbackSubmission) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          user_id: user.user.id,
          feature_name: feedback.featureName,
          feedback_type: feedback.feedbackType,
          rating: feedback.rating,
          feedback_text: feedback.feedbackText,
          metadata: feedback.metadata || {}
        });

      if (error) throw error;

      // Update the user's beta feedback count
      const { data: profile } = await supabase
        .from('profiles')
        .select('beta_feedback_count')
        .eq('id', user.user.id)
        .single();

      await supabase
        .from('profiles')
        .update({ 
          beta_feedback_count: (profile?.beta_feedback_count || 0) + 1
        })
        .eq('id', user.user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beta-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const getUserFeedback = useQuery({
    queryKey: ['beta-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beta_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BetaFeedback[];
    },
  });

  return {
    submitFeedback: submitFeedback.mutate,
    isSubmitting: submitFeedback.isPending,
    getUserFeedback,
  };
};
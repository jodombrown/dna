import { supabase } from '@/integrations/supabase/client';

export interface OnboardingFeedback {
  rating?: number;
  emoji_feedback?: string;
  feedback_text?: string;
}

export const feedbackService = {
  async submitOnboardingFeedback(feedback: OnboardingFeedback) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('onboarding_feedback')
      .insert({
        user_id: user.id,
        ...feedback
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserFeedback(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllFeedback() {
    const { data, error } = await supabase
      .from('onboarding_feedback')
      .select(`
        *,
        profiles:user_id (
          full_name,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
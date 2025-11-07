import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdinPreferences {
  id: string;
  user_id: string;
  notification_frequency: 'never' | 'low' | 'normal' | 'high';
  nudge_categories: string[];
  email_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const useAdinPreferences = () => {
  return useQuery({
    queryKey: ['adin-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get existing preferences
      let { data, error } = await supabase
        .from('adin_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no preferences exist, create default ones
      if (error && error.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from('adin_preferences')
          .insert({
            user_id: user.id,
            notification_frequency: 'normal',
            nudge_categories: ['connection', 'content', 'engagement'],
            email_enabled: true,
            in_app_enabled: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newPrefs as AdinPreferences;
      }

      if (error) throw error;
      return data as AdinPreferences;
    },
  });
};

export const useUpdateAdinPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: Partial<AdinPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('adin_preferences')
        .update(preferences)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adin-preferences'] });
      toast({
        title: 'Preferences Updated',
        description: 'Your ADIN notification preferences have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating preferences:', error);
    },
  });
};

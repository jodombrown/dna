import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type DashboardModule = 
  | 'upcoming_events'
  | 'recommended_spaces'
  | 'open_needs'
  | 'suggested_people'
  | 'recent_stories'
  | 'resume_section';

export type DashboardDensity = 'standard' | 'compact';

export interface DashboardPreferences {
  visible_modules: DashboardModule[];
  collapsed_modules: DashboardModule[];
  density: DashboardDensity;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  visible_modules: [
    'upcoming_events',
    'recommended_spaces',
    'open_needs',
    'suggested_people',
    'recent_stories',
    'resume_section'
  ],
  collapsed_modules: [],
  density: 'standard'
};

export function useDashboardPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['dashboard-preferences', user?.id],
    queryFn: async () => {
      if (!user) return DEFAULT_PREFERENCES;

      const { data, error } = await supabase.rpc('get_dashboard_preferences', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Parse the jsonb response - data is already the object we need
      if (!data) return DEFAULT_PREFERENCES;
      
      return {
        visible_modules: (data as any).visible_modules || DEFAULT_PREFERENCES.visible_modules,
        collapsed_modules: (data as any).collapsed_modules || DEFAULT_PREFERENCES.collapsed_modules,
        density: (data as any).density || DEFAULT_PREFERENCES.density,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (newPrefs: Partial<DashboardPreferences>) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_dashboard_preferences')
        .upsert({
          user_id: user.id,
          ...newPrefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-preferences', user?.id] });
      toast({
        title: 'Preferences updated',
        description: 'Your dashboard layout has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update preferences',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    preferences: preferences || DEFAULT_PREFERENCES,
    isLoading,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

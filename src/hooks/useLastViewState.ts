import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useViewState } from '@/contexts/ViewStateContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface LastViewState {
  last_view_state: string;
  last_visited_at: string;
  context: Record<string, any>;
}

export function useLastViewState() {
  const { user } = useAuth();
  const { viewState } = useViewState();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: lastState } = useQuery({
    queryKey: ['last-view-state', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const { data, error } = await supabase
          .from('user_last_view_state')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // Gracefully handle missing table or RLS issues
        if (error) {
          logger.warn('useLastViewState', 'Could not fetch last view state', error.message);
          return null;
        }
        return data as LastViewState | null;
      } catch (err) {
        logger.warn('useLastViewState', 'Error fetching last view state', err);
        return null;
      }
    },
    enabled: !!user,
    staleTime: Infinity, // Only fetch once per session
    retry: false, // Don't retry on 406 errors
  });

  const updateMutation = useMutation({
    mutationFn: async ({ viewState, context }: { viewState: string; context?: Record<string, any> }) => {
      if (!user) return;

      await supabase.rpc('update_last_view_state', {
        p_user_id: user.id,
        p_view_state: viewState,
        p_context: context || {}
      });
    },
  });

  // Track view state changes with debounce
  useEffect(() => {
    if (!user || !viewState || viewState === 'DASHBOARD_HOME') return;

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounced update (3 seconds)
    debounceTimer.current = setTimeout(() => {
      updateMutation.mutate({ 
        viewState,
        context: { timestamp: new Date().toISOString() }
      });
    }, 3000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [viewState, user?.id]);

  return {
    lastState,
    isLoading: !lastState && !!user,
  };
}

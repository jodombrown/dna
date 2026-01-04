// src/hooks/useHubMode.ts
// Hook for determining hub display mode based on content availability
// Supports URL parameter override: ?view=hub or ?view=aspiration

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type HubType = 'convene' | 'collaborate' | 'contribute' | 'convey';
export type HubMode = 'aspiration' | 'discovery' | 'hybrid';

interface HubModeConfig {
  threshold: number;
  countQuery: () => Promise<number>;
}

const HUB_CONFIGS: Record<HubType, HubModeConfig> = {
  convene: {
    threshold: 3,
    countQuery: async () => {
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_cancelled', false)
        .eq('is_public', true)
        .gte('start_time', new Date().toISOString());
      return count || 0;
    }
  },
  collaborate: {
    threshold: 5,
    countQuery: async () => {
      const { count } = await supabase
        .from('spaces')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', 'public')
        .eq('status', 'active');
      return count || 0;
    }
  },
  contribute: {
    threshold: 10,
    countQuery: async () => {
      const { count } = await supabase
        .from('contribution_needs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);
      return count || 0;
    }
  },
  convey: {
    threshold: 10,
    countQuery: async () => {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .in('post_type', ['story', 'update', 'impact']);
      return count || 0;
    }
  }
};

export interface UseHubModeResult {
  mode: HubMode;
  contentCount: number;
  threshold: number;
  isLoading: boolean;
  progress: number; // 0-100 percentage toward threshold
}

export function useHubMode(hub: HubType): UseHubModeResult {
  const [searchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const config = HUB_CONFIGS[hub];

  const { data: contentCount = 0, isLoading } = useQuery({
    queryKey: ['hubMode', hub],
    queryFn: config.countQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // URL parameter override: ?view=hub forces discovery, ?view=aspiration forces aspiration
  let mode: HubMode;
  if (viewParam === 'hub') {
    mode = 'discovery';
  } else if (viewParam === 'aspiration') {
    mode = 'aspiration';
  } else if (contentCount >= config.threshold) {
    mode = 'discovery';
  } else if (contentCount > 0) {
    mode = 'hybrid';
  } else {
    mode = 'aspiration';
  }

  const progress = Math.min(100, Math.round((contentCount / config.threshold) * 100));

  return {
    mode,
    contentCount,
    threshold: config.threshold,
    isLoading,
    progress
  };
}

// Utility to get hub display name
export function getHubDisplayName(hub: HubType): string {
  const names: Record<HubType, string> = {
    convene: 'Convene',
    collaborate: 'Collaborate',
    contribute: 'Contribute',
    convey: 'Convey'
  };
  return names[hub];
}

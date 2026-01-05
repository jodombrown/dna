// src/pages/dna/contribute/ContributeHub.tsx
// Mode switch wrapper for Contribute hub with error handling

import React from 'react';
import { useHubMode } from '@/hooks/useHubMode';
import { ContributeAspiration } from '@/components/hubs/contribute';
import { EarlyContentPreview } from '@/components/hubs/shared';
import { ContributeDiscovery } from './ContributeDiscovery';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ContributeHub() {
  const { mode, contentCount, isLoading } = useHubMode('contribute');

  // Fetch early opportunities for hybrid mode with error handling
  const { data: earlyOpportunities } = useQuery({
    queryKey: ['earlyOpportunities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('contribution_needs')
          .select('id, title, type, created_at')
          .in('status', ['open', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(4);
        if (error) {
          console.warn('[ContributeHub] Failed to fetch early opportunities:', error);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[ContributeHub] Error fetching early opportunities:', err);
        return [];
      }
    },
    enabled: mode === 'hybrid',
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald" />
      </div>
    );
  }

  // Discovery mode - render full hub
  if (mode === 'discovery') {
    return <ContributeDiscovery />;
  }

  // Aspiration or Hybrid mode
  return (
    <ContributeAspiration
      earlyContent={
        mode === 'hybrid' && earlyOpportunities?.length ? (
          <EarlyContentPreview
            items={earlyOpportunities.map(opp => ({
              id: opp.id,
              title: opp.title,
              subtitle: opp.type || 'Opportunity',
              date: opp.created_at,
              href: `/opportunities/${opp.id}`
            }))}
            hub="contribute"
          />
        ) : undefined
      }
    />
  );
}

export default ContributeHub;

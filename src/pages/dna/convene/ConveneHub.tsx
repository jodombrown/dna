// src/pages/dna/convene/ConveneHub.tsx
// Mode switch wrapper for Convene hub

import React from 'react';
import { useHubMode } from '@/hooks/useHubMode';
import { ConveneAspiration } from '@/components/hubs/convene';
import { EarlyContentPreview } from '@/components/hubs/shared';
import { ConveneDiscovery } from './ConveneDiscovery';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ConveneHub() {
  const { mode, contentCount, isLoading } = useHubMode('convene');

  // Fetch early events for hybrid mode
  const { data: earlyEvents } = useQuery({
    queryKey: ['earlyEvents'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, start_time, location_name, cover_image_url')
        .eq('is_cancelled', false)
        .eq('is_public', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4);
      return data || [];
    },
    enabled: mode === 'hybrid'
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
    return <ConveneDiscovery />;
  }

  // Aspiration or Hybrid mode
  return (
    <ConveneAspiration
      earlyContent={
        mode === 'hybrid' && earlyEvents?.length ? (
          <EarlyContentPreview
            items={earlyEvents.map(event => ({
              id: event.id,
              title: event.title,
              subtitle: event.location_name || 'Virtual Event',
              date: event.start_time,
              image: event.cover_image_url,
              href: `/events/${event.id}`
            }))}
            hub="convene"
          />
        ) : undefined
      }
    />
  );
}

export default ConveneHub;

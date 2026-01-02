// src/pages/dna/convey/ConveyHub.tsx
// Mode switch wrapper for Convey hub

import React from 'react';
import { useHubMode } from '@/hooks/useHubMode';
import { ConveyAspiration } from '@/components/hubs/convey';
import { EarlyContentPreview } from '@/components/hubs/shared';
import { ConveyDiscovery } from './ConveyDiscovery';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ConveyHub() {
  const { mode, contentCount, isLoading } = useHubMode('convey');

  // Fetch early stories for hybrid mode
  const { data: earlyStories } = useQuery({
    queryKey: ['earlyStories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, content, image_url, created_at')
        .eq('is_deleted', false)
        .in('post_type', ['story', 'update', 'impact'])
        .order('created_at', { ascending: false })
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
    return <ConveyDiscovery />;
  }

  // Aspiration or Hybrid mode
  return (
    <ConveyAspiration
      earlyContent={
        mode === 'hybrid' && earlyStories?.length ? (
          <EarlyContentPreview
            items={earlyStories.map(story => ({
              id: story.id,
              title: story.content?.slice(0, 60) + (story.content?.length > 60 ? '...' : '') || 'Story',
              subtitle: 'Story',
              date: story.created_at,
              image: story.image_url,
              href: `/posts/${story.id}`
            }))}
            hub="convey"
          />
        ) : undefined
      }
    />
  );
}

export default ConveyHub;

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventManagementContext } from '@/components/convene/management/EventManagementContext';
import EventOverview from '@/components/convene/EventOverview';
import type { Event as ConveneEvent } from '@/types/eventTypes';

interface EventOverviewPanelProps {
  eventId: string;
}

// EventOverview normally reads event/isOrganizer from EventManagementContext,
// which EventDetail provides around its <Outlet>. The MyEvents third column
// renders EventOverview directly, with no route/Outlet in between, so this
// panel fetches the event itself and supplies that same context. It's only
// ever reached from a Hosting card, so the viewer is always the organizer —
// no role lookup needed, unlike EventDetail's arbitrary-viewer case.
export function EventOverviewPanel({ eventId }: EventOverviewPanelProps) {
  const { data: event, isLoading, refetch } = useQuery({
    queryKey: ['event-detail-panel', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const { data: organizer } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, headline')
        .eq('id', data.organizer_id)
        .maybeSingle();

      let group = null;
      if (data.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select('id, name, slug, description, avatar_url, member_count')
          .eq('id', data.group_id)
          .maybeSingle();
        group = groupData;
      }

      return { ...data, organizer, group };
    },
    enabled: !!eventId,
  });

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <EventManagementContext.Provider
      value={{
        event: event as unknown as ConveneEvent,
        userRole: 'manager',
        isOrganizer: true,
        refetchEvent: () => { refetch(); },
      }}
    >
      <EventOverview eventId={eventId} />
    </EventManagementContext.Provider>
  );
}

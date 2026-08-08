/**
 * Guest-facing event view.
 * Rendered by PublicEventPage when the URL carries ?guest_token=<uuid>.
 *
 * Resolves entirely through rpc_get_guest_registration — a SECURITY DEFINER
 * RPC scoped to the token holder's own registration, not the normal
 * get_public_event projection. No auth session exists here; the token
 * itself is the guest's only credential.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Video, Globe, ExternalLink } from 'lucide-react';
import Footer from '@/components/Footer';

interface DeliveryEndpoint {
  type: 'physical_room' | 'external_link';
  provider: string | null;
  join_credential: string | null;
}

// A guest can see the meeting link (it's returned by the RPC the moment
// their token resolves), but the Join button itself stays disabled until
// the room is actually open — matches the general "no early join" pattern
// rather than exposing a live meeting before anyone is there to greet them.
const JOIN_WINDOW_MINUTES_BEFORE_START = 15;

const getFormatIcon = (format: string) => {
  if (format === 'virtual') return <Video className="w-4 h-4" />;
  if (format === 'hybrid') return <Globe className="w-4 h-4" />;
  return <MapPin className="w-4 h-4" />;
};

export const GuestEventView = ({ guestToken }: { guestToken: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['guest-event-registration', guestToken],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('rpc_get_guest_registration', {
        p_token: guestToken,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row) throw new Error('Registration not found');
      return row;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Link not found</h1>
          <p className="text-muted-foreground">
            This guest link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const endpoints = (data.endpoints as DeliveryEndpoint[] | null) || [];
  const physicalEndpoint = endpoints.find((e) => e.type === 'physical_room');
  const virtualEndpoint = endpoints.find((e) => e.type === 'external_link');

  const startTime = data.event_start_time ? new Date(data.event_start_time) : null;
  const joinOpensAt = startTime
    ? new Date(startTime.getTime() - JOIN_WINDOW_MINUTES_BEFORE_START * 60 * 1000)
    : null;
  const joinWindowOpen = !!joinOpensAt && Date.now() >= joinOpensAt.getTime();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 pt-6 pb-6">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <Badge variant="outline" className="capitalize flex items-center gap-1 w-fit mb-3">
              {getFormatIcon(data.event_format)}
              {data.event_format?.replace('_', ' ') || 'In Person'}
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4">{data.event_title}</h1>

            {startTime && (
              <div className="flex items-start gap-3 mb-4">
                <Calendar className="w-5 h-5 mt-0.5 text-primary" />
                <p className="font-medium">
                  {startTime.toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            )}

            {physicalEndpoint?.join_credential && (
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <p className="font-medium">{physicalEndpoint.join_credential}</p>
              </div>
            )}

            {virtualEndpoint?.join_credential && (
              <Button
                className="w-full"
                disabled={!joinWindowOpen}
                asChild={joinWindowOpen}
              >
                {joinWindowOpen ? (
                  <a href={virtualEndpoint.join_credential} target="_blank" rel="noopener noreferrer">
                    Join <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                ) : (
                  <span>Join opens {JOIN_WINDOW_MINUTES_BEFORE_START} minutes before start</span>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

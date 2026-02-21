import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, TrendingUp, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { logger } from '@/lib/logger';

export function ConveneRightWidgets() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Next upcoming event
  const { data: nextEvent } = useQuery({
    queryKey: ['next-event', user?.id],
    queryFn: async () => {
      try {
        if (!user) return null;
        
        const now = new Date().toISOString();
        
        // Try to find next hosting event
        const { data: hosting, error: hostingError } = await supabase
          .from('events')
          .select('id, title, start_time, format')
          .eq('organizer_id', user.id)
          .eq('is_cancelled', false)
          .gte('start_time', now)
          .order('start_time', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (hostingError) {
          logger.warn('ConveneRightWidgets', 'Error fetching hosting events:', hostingError);
        }

        if (hosting) return { ...hosting, role: 'hosting' };

        // If not hosting, try to find next attending event
        const { data: attendeeData, error: attendeeError } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('status', 'going')
          .limit(1);

        if (attendeeError) {
          logger.warn('ConveneRightWidgets', 'Error fetching attendee data:', attendeeError);
          return null;
        }

        if (!attendeeData || attendeeData.length === 0) return null;

        const { data: attending, error: attendingError } = await supabase
          .from('events')
          .select('id, title, start_time, format')
          .eq('id', attendeeData[0].event_id)
          .eq('is_cancelled', false)
          .gte('start_time', now)
          .order('start_time', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (attendingError) {
          logger.warn('ConveneRightWidgets', 'Error fetching attending events:', attendingError);
          return null;
        }

        return attending ? { ...attending, role: 'attending' } : null;
      } catch (error) {
        logger.warn('ConveneRightWidgets', 'Failed to fetch next event:', error);
        return null;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <div className="space-y-4 sticky top-4">
      {/* Quick Host Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4 text-dna-emerald" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            size="sm"
            className="w-full bg-dna-emerald hover:bg-dna-forest"
            onClick={() => navigate('/dna/convene/events/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Host an Event
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/dna/convene/groups')}
          >
            Find Communities
          </Button>
        </CardContent>
      </Card>

      {/* Next Event Card */}
      {nextEvent && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-dna-copper" />
              Next Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/dna/convene/events/${nextEvent.id}`)}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-sm line-clamp-2">{nextEvent.title}</h4>
                <Badge variant="secondary" className="text-xs ml-2 capitalize">
                  {nextEvent.role}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(nextEvent.start_time), 'MMM d, h:mm a')}
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {nextEvent.format}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Convene Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Your personalized event recommendations are powered by DIA, learning from your interests and network.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

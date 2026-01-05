import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const RegisteredEventsWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: registeredEvents, isLoading } = useQuery({
    queryKey: ['registered-events', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select(`
            *,
            events:event_id (
              id,
              title,
              date_time,
              location,
              attendee_count,
              is_virtual
            )
          `)
          .eq('user_id', user!.id)
          .eq('status', 'going')
          .order('registered_at', { ascending: false })
          .limit(3);
        
        if (error) {
          console.warn('[RegisteredEventsWidget] Error fetching events:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.warn('[RegisteredEventsWidget] Failed to fetch events:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-dna-emerald" />
          Your Registered Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!registeredEvents || registeredEvents.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              You haven't registered for any events yet
            </p>
            <Button
              size="sm"
              className="bg-dna-emerald hover:bg-dna-forest"
              onClick={() => navigate('/dna/convene/events')}
            >
              Browse Events
            </Button>
          </div>
        ) : (
          <>
            {registeredEvents.map((registration) => {
              const event = registration.events as any;
              if (!event) return null;
              
              return (
                <div
                  key={registration.id}
                  className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/dna/convene/events')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate">
                        {event.title}
                      </h4>
                      {event.is_virtual && (
                        <Badge variant="secondary" className="text-xs shrink-0">Virtual</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(event.date_time), 'MMM d, h:mm a')}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-1 text-xs text-dna-emerald">
                      <CheckCircle className="h-3 w-3" />
                      <span>Registered</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dna/convene/events')}
            >
              View All Events
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

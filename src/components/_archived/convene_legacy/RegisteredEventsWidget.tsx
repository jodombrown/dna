import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';

export const RegisteredEventsWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: registeredEvents, isLoading } = useQuery({
    queryKey: ['registered-events', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('event_attendees')
          .select(`
            *,
            events:event_id (
              id,
              title,
              start_time,
              location_name,
              location_city,
              format
            )
          `)
          .eq('user_id', user!.id)
          .eq('status', 'going')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) {
          logger.warn('RegisteredEventsWidget', 'Error fetching events:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        logger.warn('RegisteredEventsWidget', 'Failed to fetch events:', error);
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
            {registeredEvents.map((registration: any) => {
              const event = registration.events;
              if (!event) return null;
              const isVirtual = event.format === 'virtual' || event.format === 'hybrid';
              const location = event.location_name || event.location_city || '';
              const dateTime = event.start_time;
              
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
                      {isVirtual && (
                        <Badge variant="secondary" className="text-xs shrink-0">Virtual</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {dateTime ? format(new Date(dateTime), 'MMM d, h:mm a') : 'TBD'}
                      </span>
                    </div>

                    {location && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{location}</span>
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

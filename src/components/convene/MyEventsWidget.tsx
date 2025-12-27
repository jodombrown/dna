import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const MyEventsWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: myEvents, isLoading } = useQuery({
    queryKey: ['my-events', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user!.id)
        .order('start_time', { ascending: true })
        .limit(3);
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-copper-500" />
            My Events
          </span>
          {/* Phase 1.5: Event management dashboard */}
          {/* <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate('/dna/convene/my-events')}
          >
            Manage
          </Button> */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!myEvents || myEvents.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              You haven't created any events yet
            </p>
            <Button
              size="sm"
              className="bg-dna-emerald hover:bg-dna-forest"
              onClick={() => navigate('/dna/events')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Button>
          </div>
        ) : (
          <>
            {myEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate('/dna/events')}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {event.title}
                  </h4>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(event.start_time), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  {(event.location_name || event.location_city) && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {event.location_name || `${event.location_city}${event.location_country ? ', ' + event.location_country : ''}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>0 registered</span>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dna/events')}
            >
              <Plus className="h-3 w-3 mr-2" />
              Create New Event
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

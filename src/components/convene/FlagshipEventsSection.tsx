import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export const FlagshipEventsSection = () => {
  const navigate = useNavigate();

  const { data: flagshipEvents = [], isLoading } = useQuery({
    queryKey: ['flagship-events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            start_time,
            format,
            event_type,
            location_city,
            location_country,
            cover_image_url
          `)
          .eq('is_cancelled', false)
          .eq('is_flagship', true)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(6);

        if (error) {
          console.warn('[FlagshipEventsSection] Error fetching events:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.warn('[FlagshipEventsSection] Failed to fetch events:', error);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">DNA Featured Events</h2>
        <p className="text-muted-foreground text-sm">
          Official convenings hosted by DNA and key partners
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-32 bg-muted rounded mb-3"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (flagshipEvents.length === 0) {
    return null; // Hide if no flagship events (but DNA should seed some)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">DNA Featured Events</h2>
        <p className="text-muted-foreground text-sm">
          Official convenings hosted by DNA and key partners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flagshipEvents.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(`/dna/convene/events/${event.id}`)}
          >
            {event.cover_image_url ? (
              <div className="relative h-32 overflow-hidden">
                <img
                  src={event.cover_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-dna-emerald/90 backdrop-blur-sm">
                    <Star className="h-3 w-3 mr-1" />
                    DNA Official
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-dna-emerald/20 to-dna-forest/20 flex items-center justify-center">
                <Star className="h-8 w-8 text-dna-emerald" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{event.title}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.start_time), 'MMM d, h:mm a')}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.format === 'virtual' 
                    ? 'Virtual Event' 
                    : `${event.location_city || ''}${event.location_city && event.location_country ? ', ' : ''}${event.location_country || ''}`
                  }
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="capitalize">
                  {event.event_type?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

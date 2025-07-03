
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EventData {
  id: string;
  title: string;
  date_time: string | null;
  location: string | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
}

interface EventCardProps {
  event: EventData;
  showInFeed?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showInFeed = false }) => {
  return (
    <Card className={`${showInFeed ? 'border-l-4 border-l-dna-copper' : ''} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-dna-copper" />
          <span className="font-semibold text-dna-copper">Event</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
        )}
        
        <div className="flex flex-col gap-2">
          {event.date_time && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{new Date(event.date_time).toLocaleString()}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-dna-copper/10 text-dna-copper hover:bg-dna-copper hover:text-white text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;

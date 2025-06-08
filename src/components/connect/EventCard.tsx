
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users as UsersIcon } from 'lucide-react';
import { Event } from '@/types/search';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg">{event.title}</CardTitle>
      <div className="flex gap-2">
        <Badge variant="outline">{event.type}</Badge>
        {event.is_virtual && <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>}
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {event.date_time ? new Date(event.date_time).toLocaleDateString() : 'TBD'}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          {event.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="w-4 h-4" />
          {event.attendee_count} attending
        </div>
      </div>
      
      <Button 
        className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
        onClick={() => event.registration_url && window.open(event.registration_url, '_blank')}
      >
        Register
      </Button>
    </CardContent>
  </Card>
);

export default EventCard;

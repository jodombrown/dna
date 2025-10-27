import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EventListItem } from '@/types/events';
import { 
  Calendar, 
  MapPin, 
  Video, 
  Users, 
  Clock,
  Globe,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: EventListItem;
  onRSVP?: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
}

export function EventCard({ event, onRSVP }: EventCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getEventTypeColor = () => {
    const colors = {
      conference: 'bg-purple-100 text-purple-700 border-purple-200',
      workshop: 'bg-blue-100 text-blue-700 border-blue-200',
      meetup: 'bg-green-100 text-green-700 border-green-200',
      webinar: 'bg-orange-100 text-orange-700 border-orange-200',
      networking: 'bg-pink-100 text-pink-700 border-pink-200',
      social: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[event.event_type] || colors.other;
  };

  const getFormatIcon = () => {
    switch (event.format) {
      case 'virtual':
        return <Video className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      case 'hybrid':
        return <Globe className="h-4 w-4" />;
    }
  };

  const formatEventDate = () => {
    const start = new Date(event.start_time);
    return format(start, 'MMM dd, yyyy');
  };

  const formatEventTime = () => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const getLocation = () => {
    if (event.format === 'virtual') {
      return 'Virtual Event';
    }
    if (event.location_city && event.location_country) {
      return `${event.location_city}, ${event.location_country}`;
    }
    return event.location_name || 'Location TBA';
  };

  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/dna/events/${event.event_id}`)}
    >
      {/* Cover Image */}
      {event.cover_image_url ? (
        <div className="h-48 overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-[hsl(151,75%,50%)] to-[hsl(151,75%,35%)] flex items-center justify-center">
          <Calendar className="h-16 w-16 text-white opacity-50" />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar
            className="h-10 w-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dna/${event.organizer_username}`);
            }}
          >
            <AvatarImage src={event.organizer_avatar_url} alt={event.organizer_full_name} />
            <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-sm">
              {getInitials(event.organizer_full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className={cn('text-xs', getEventTypeColor())}>
                {event.event_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getFormatIcon()}
                <span className="ml-1 capitalize">{event.format}</span>
              </Badge>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {event.title}
            </h3>
            <p
              className="text-sm text-muted-foreground hover:text-[hsl(151,75%,50%)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dna/${event.organizer_username}`);
              }}
            >
              by {event.organizer_full_name}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatEventDate()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatEventTime()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {getFormatIcon()}
            <span className="truncate">{getLocation()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.attendee_count} {event.attendee_count === 1 ? 'attendee' : 'attendees'}
              {event.max_attendees && ` / ${event.max_attendees}`}
            </span>
            {isFull && (
              <Badge variant="secondary" className="text-xs">Full</Badge>
            )}
          </div>
        </div>

        {/* RSVP Status / Actions */}
        <div className="flex gap-2">
          {event.user_rsvp_status === 'going' ? (
            <Badge className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] flex-1 justify-center py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              You're Going
            </Badge>
          ) : event.user_rsvp_status === 'maybe' ? (
            <Badge variant="outline" className="flex-1 justify-center py-2">
              <HelpCircle className="h-4 w-4 mr-2" />
              Maybe
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dna/events/${event.event_id}`);
              }}
            >
              View Details
            </Button>
          )}
          {event.is_organizer && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dna/events/${event.event_id}/edit`);
              }}
            >
              Manage
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

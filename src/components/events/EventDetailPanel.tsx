import React from 'react';
import { Calendar, MapPin, Users, Clock, Globe, ExternalLink, MessageCircle } from 'lucide-react';
import { Event } from '@/types/search';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TYPOGRAPHY } from '@/lib/typography.config';
import { Separator } from '@/components/ui/separator';
import { useMessage } from '@/contexts/MessageContext';
import { useAuth } from '@/contexts/AuthContext';

interface EventDetailPanelProps {
  event: Event | null;
  onRegister?: (event: Event) => void;
}

/**
 * EventDetailPanel - Right column detail view for CONVENE_MODE
 * Shows detailed information about the selected event
 */
const EventDetailPanel: React.FC<EventDetailPanelProps> = ({ event, onRegister }) => {
  const { openMessageOverlay } = useMessage();
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (!event) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/30">
        <CardContent className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className={`${TYPOGRAPHY.h4} text-muted-foreground mb-2`}>
            Select an event to view details
          </h3>
          <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground`}>
            Click on any event from the list to see more information
          </p>
        </CardContent>
      </Card>
    );
  }

  const eventDate = new Date(event.date_time);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Card className="h-full overflow-y-auto">
      {/* Event Banner */}
      {event.banner_url ? (
        <img
          src={event.banner_url}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-dna-emerald to-dna-forest flex items-center justify-center">
          <Calendar className="w-20 h-20 text-white opacity-50" />
        </div>
      )}

      <CardHeader className="space-y-4">
        {/* Event Title */}
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{event.type}</Badge>
            {event.is_virtual && (
              <Badge className="bg-dna-emerald text-white">
                <Globe className="w-3 h-3 mr-1" />
                Virtual
              </Badge>
            )}
          </div>
          <h2 className={TYPOGRAPHY.h2}>{event.title}</h2>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className={`${TYPOGRAPHY.bodySmall} font-medium`}>{formattedDate}</p>
              <p className={`${TYPOGRAPHY.caption} text-muted-foreground`}>{formattedTime}</p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className={TYPOGRAPHY.bodySmall}>{event.location}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className={TYPOGRAPHY.bodySmall}>
                {event.attendee_count || 0} attending
                {event.max_attendees && ` • ${event.max_attendees} capacity`}
              </p>
            </div>
          </div>
        </div>

        {/* Register Button */}
        <Button 
          size="lg" 
          className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
          onClick={() => onRegister?.(event)}
        >
          Register for Event
        </Button>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 pt-6">
        {/* Description */}
        <div>
          <h3 className={`${TYPOGRAPHY.h4} mb-2`}>About this event</h3>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground whitespace-pre-wrap`}>
            {event.description}
          </p>
        </div>

        {/* Additional Info */}
        {event.registration_url && (
          <div>
            <h3 className={`${TYPOGRAPHY.h4} mb-2`}>Event Link</h3>
            <a 
              href={event.registration_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-dna-emerald hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              <span className={TYPOGRAPHY.bodySmall}>Visit event page</span>
            </a>
          </div>
        )}

        {/* Host Info with Message Button */}
        {event.creator_profile && (
          <div>
            <h3 className={`${TYPOGRAPHY.h4} mb-3`}>Hosted by</h3>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={event.creator_profile.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(event.creator_profile.full_name || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className={`${TYPOGRAPHY.body} font-semibold`}>
                  {event.creator_profile.full_name}
                </p>
              </div>
              {user?.id !== event.creator_profile.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openMessageOverlay(event.creator_profile.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventDetailPanel;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { format, formatDistanceToNow } from 'date-fns';

interface FeedEventCardProps {
  activity: Activity;
}

export const FeedEventCard: React.FC<FeedEventCardProps> = ({ activity }) => {
  const navigate = useNavigate();
  const eventData = activity.entity_data;

  const handleViewProfile = () => {
    navigate(`/dna/${activity.actor_username}`);
  };

  const handleViewEvent = () => {
    navigate(`/dna/convene/events/${eventData.event_id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-10 w-10 cursor-pointer" onClick={handleViewProfile}>
                <AvatarImage src={activity.actor_avatar_url} alt={activity.actor_full_name} />
                <AvatarFallback>
                  {activity.actor_full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="text-sm">
                  <span 
                    className="font-semibold hover:underline cursor-pointer"
                    onClick={handleViewProfile}
                  >
                    {activity.actor_full_name}
                  </span>
                  {' '}created a new event
                </p>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {/* Event Details */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-base">{eventData.event_title}</h4>
              
              {eventData.event_description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {eventData.event_description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {eventData.start_time && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(eventData.start_time), 'MMM dd, yyyy • h:mm a')}
                  </div>
                )}
                
                {eventData.is_virtual ? (
                  <Badge variant="secondary" className="text-xs">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </Badge>
                ) : eventData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {eventData.location}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3">
              <Button
                size="sm"
                onClick={handleViewEvent}
              >
                View Event
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

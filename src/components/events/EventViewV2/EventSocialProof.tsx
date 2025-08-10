import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UsersIcon, StarIcon, MessageCircleIcon } from 'lucide-react';
import { Event } from '@/types/eventTypes';

interface EventSocialProofProps {
  event: Event;
}

const EventSocialProof: React.FC<EventSocialProofProps> = ({ event }) => {
  // Mock data - in real implementation, this would come from the database
  const mockAttendees = [
    { id: '1', name: 'Sarah Chen', avatar: '', role: 'Product Manager at Tech Corp' },
    { id: '2', name: 'Marcus Johnson', avatar: '', role: 'Entrepreneur' },
    { id: '3', name: 'Aisha Patel', avatar: '', role: 'Software Engineer' },
    { id: '4', name: 'David Kim', avatar: '', role: 'Designer' },
  ];

  const mockTestimonials = [
    {
      id: '1',
      name: 'Jessica Williams',
      role: 'Startup Founder',
      content: 'Amazing event with great networking opportunities. Learned so much!',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Attendees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UsersIcon className="w-5 h-5" />
            <span>Who's Coming</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockAttendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={attendee.avatar} alt={attendee.name} />
                  <AvatarFallback>
                    {attendee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{attendee.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{attendee.role}</p>
                </div>
              </div>
            ))}
          </div>
          
          {event.attendee_count > 4 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                and {event.attendee_count - 4} others
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircleIcon className="w-5 h-5" />
            <span>What People Say</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="border-l-4 border-primary pl-4 space-y-2">
              <div className="flex items-center space-x-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm italic">"{testimonial.content}"</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{testimonial.name}</p>
                <Badge variant="secondary" className="text-xs">{testimonial.role}</Badge>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Join {event.attendee_count} others at this event
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{event.attendee_count}</p>
              <p className="text-sm text-muted-foreground">Registered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">4.8</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">95%</p>
              <p className="text-sm text-muted-foreground">Recommend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventSocialProof;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Calendar } from 'lucide-react';
import { Event } from '@/types/eventTypes';

interface SocialProofProps {
  event: Event;
}

const SocialProof: React.FC<SocialProofProps> = ({ event }) => {
  const [attendees, setAttendees] = useState([
    { name: 'Sarah Johnson', avatar: '', role: 'Product Manager at TechCorp' },
    { name: 'Michael Chen', avatar: '', role: 'Software Engineer' },
    { name: 'Emily Davis', avatar: '', role: 'Designer at StartupXYZ' },
    { name: 'David Wilson', avatar: '', role: 'Marketing Lead' },
    { name: 'Lisa Thompson', avatar: '', role: 'Data Scientist' },
  ]);

  const testimonials = [
    {
      author: 'Alex Rodriguez',
      role: 'Senior Developer',
      content: 'Amazing event! Learned so much and made great connections.',
      rating: 5
    },
    {
      author: 'Maria Santos',
      role: 'UX Designer',
      content: 'Well organized and incredibly valuable content.',
      rating: 5
    }
  ];

  const stats = [
    { icon: Users, label: 'Total Attendees', value: event.attendee_count },
    { icon: Star, label: 'Average Rating', value: '4.8/5' },
    { icon: Calendar, label: 'Past Events', value: '12+' },
  ];

  return (
    <div className="space-y-6">
      {/* Attendee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Who's Coming ({event.attendee_count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attendees.slice(0, 6).map((attendee, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={attendee.avatar} />
                  <AvatarFallback>
                    {attendee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{attendee.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {attendee.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {event.attendee_count > 6 && (
            <div className="mt-4 text-center">
              <Badge variant="outline">
                +{event.attendee_count - 6} more attendees
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Event Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="space-y-2">
                  <Icon className="w-6 h-6 mx-auto text-primary" />
                  <div className="font-semibold text-lg">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>What People Say</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border-l-4 border-primary pl-4">
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm mb-2">"{testimonial.content}"</p>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{testimonial.author}</span>, {testimonial.role}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Host Information */}
      {event.creator_profile && (
        <Card>
          <CardHeader>
            <CardTitle>Hosted by</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback>
                  {event.creator_profile.full_name?.split(' ').map(n => n[0]).join('') || 'H'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{event.creator_profile.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  Event Organizer
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialProof;
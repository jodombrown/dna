import React from 'react';
import { Calendar, Users, MapPin, Video, ArrowRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SwipeableCardStack from './SwipeableCardStack';

const ConveneSection = () => {
  const navigate = useNavigate();

  const events = [
    {
      title: 'AfriTech Summit 2024',
      type: 'Panel Discussion',
      date: 'March 15, 2024',
      time: '2:00 PM WAT',
      location: 'Virtual',
      attendees: 247,
      host: { name: 'Chinelo Okeke', initials: 'CO' },
      gradient: 'from-dna-copper to-dna-gold',
      tags: ['Innovation', 'Tech', 'Networking'],
    },
    {
      title: 'Diaspora Investor Circle',
      type: 'Pitch Night',
      date: 'March 22, 2024',
      time: '6:00 PM EST',
      location: 'New York, USA',
      attendees: 45,
      host: { name: 'James Adeyemi', initials: 'JA' },
      gradient: 'from-dna-gold to-dna-ochre',
      tags: ['Investment', 'Startups', 'Capital'],
    },
    {
      title: 'Creative Africa Workshop',
      type: 'Skill Building',
      date: 'March 28, 2024',
      time: '10:00 AM EAT',
      location: 'Nairobi, Kenya',
      attendees: 89,
      host: { name: 'Fatima Diallo', initials: 'FD' },
      gradient: 'from-dna-emerald to-dna-forest',
      tags: ['Creative', 'Workshop', 'Skills'],
    },
  ];

  const handleCardClick = (index: number) => {
    navigate('/convene');
  };

  return (
    <section id="convene-section" className="mb-16 w-full -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="text-center mb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Convene</h2>
        </div>
        <p className="text-xl font-semibold text-gray-900 mb-3">
          Where Ideas Meet Action
        </p>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Gather with your network by attending events that matter, creating your own convenings, or supporting gatherings that align with your vision—whether digital or in-person.
        </p>
        <Button 
          onClick={() => navigate('/convene')}
          className="bg-dna-copper hover:bg-dna-gold text-white inline-flex items-center gap-2"
        >
          Browse All Events
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 w-full">
        <SwipeableCardStack
          cards={events.map((event) => (
            <div className={`bg-gradient-to-br ${event.gradient} rounded-3xl p-1.5 shadow-2xl h-full w-full`}>
              <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                <div className={`bg-gradient-to-r ${event.gradient} text-white p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Upcoming Event</h3>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-white/80">Join your community</p>
                </div>
                
                <div className="p-6 space-y-4 flex-1">
                  {/* Event Title & Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{event.title}</h4>
                      <Badge className="bg-dna-copper text-white text-xs">{event.type}</Badge>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-dna-copper" />
                      <span className="font-medium text-gray-700">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-dna-copper" />
                      <span className="font-medium text-gray-700">{event.time}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    {event.location === 'Virtual' ? (
                      <Video className="w-4 h-4 text-dna-emerald" />
                    ) : (
                      <MapPin className="w-4 h-4 text-dna-forest" />
                    )}
                    <span className="font-medium text-gray-700">{event.location}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-dna-gold/10 text-dna-ochre text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Attendees & Host */}
                  <div className="bg-dna-copper/5 rounded-xl p-4 border-2 border-dna-copper/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-dna-copper" />
                        <span className="text-sm font-semibold text-gray-900">
                          {event.attendees} attending
                        </span>
                      </div>
                      <Star className="w-4 h-4 text-dna-gold fill-dna-gold" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-dna-copper text-white text-xs font-bold">
                          {event.host.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-gray-700">Hosted by</p>
                        <p className="text-sm font-semibold text-gray-900">{event.host.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full bg-gradient-to-r from-dna-copper to-dna-gold hover:from-dna-gold hover:to-dna-copper text-white font-semibold"
                  >
                    RSVP Now
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Meet attendees who share your interests →
                  </p>
                </div>
              </div>
            </div>
          ))}
          onCardClick={handleCardClick}
        />
      </div>
    </section>
  );
};

export default ConveneSection;

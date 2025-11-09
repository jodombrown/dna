import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Clock, Globe, Sparkles, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SwipeableCardStack from './SwipeableCardStack';

const ConveneSection = () => {
  const navigate = useNavigate();

  const events = [
    {
      title: 'African Tech Summit 2025',
      type: 'Tech Conference',
      date: 'March 15',
      time: '2:00 PM WAT',
      location: 'Lagos, Nigeria',
      attendees: '250+ attendees registered',
      host: 'African Tech Leaders',
      format: 'Hybrid',
      gradient: 'from-dna-copper to-dna-gold',
      featured: true,
    },
    {
      title: 'Diaspora Investment Forum',
      type: 'Investment Event',
      date: 'March 22',
      time: '6:00 PM GMT',
      location: 'London, UK',
      attendees: '150+ attendees registered',
      host: 'DNA Investment Circle',
      format: 'In-Person',
      gradient: 'from-dna-gold to-dna-ochre',
      featured: false,
    },
    {
      title: 'Creative Africa Workshop',
      type: 'Workshop',
      date: 'March 28',
      time: '10:00 AM EAT',
      location: 'Virtual Event',
      attendees: '500+ attendees registered',
      host: 'Creative Diaspora Network',
      format: 'Virtual',
      gradient: 'from-dna-emerald to-dna-forest',
      featured: true,
    },
  ];

  const handleCardClick = (index: number) => {
    navigate('/convene');
  };

  const renderCard = (event: typeof events[0]) => (
    <div className={`bg-gradient-to-br ${event.gradient} rounded-3xl p-1.5 shadow-2xl h-full w-full`}>
      <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
        <div className={`bg-gradient-to-r ${event.gradient} text-white p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Upcoming Diaspora Events</h3>
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-sm text-white/80">Join the movement</p>
        </div>
        
        <div className="p-6 space-y-6 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-dna-copper text-white text-xs">{event.type}</Badge>
              {event.featured && (
                <div className="flex items-center gap-1 text-dna-gold">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-bold">Featured</span>
                </div>
              )}
            </div>
            <h4 className="font-bold text-xl text-gray-900 mb-4">{event.title}</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-4 h-4 text-dna-copper flex-shrink-0" />
              <span className="text-sm font-medium">{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-4 h-4 text-dna-copper flex-shrink-0" />
              <span className="text-sm font-medium">{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              {event.format === 'Hybrid' ? (
                <Globe className="w-4 h-4 text-dna-copper flex-shrink-0" />
              ) : event.format === 'Virtual' ? (
                <Video className="w-4 h-4 text-dna-copper flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-dna-copper flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{event.location}</span>
            </div>
          </div>

          <div className="bg-dna-copper/5 rounded-xl p-4 border-2 border-dna-copper/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-dna-copper" />
                <span className="text-sm font-semibold text-gray-900">{event.attendees}</span>
              </div>
              <Badge variant="secondary" className="text-xs">{event.format}</Badge>
            </div>
            <p className="text-xs text-gray-600">
              Hosted by {event.host}
            </p>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-dna-copper to-dna-gold hover:from-dna-gold hover:to-dna-copper text-white font-semibold"
          >
            RSVP Now
          </Button>

          <p className="text-xs text-center text-gray-500">
            After RSVP, create your own event →
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="convene-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          {/* Left: Card Preview (Desktop) / Swipeable Cards (Mobile) */}
          <div className="order-2 lg:order-1">
            <SwipeableCardStack
              cards={events.map((event) => renderCard(event))}
              onCardClick={handleCardClick}
            />
          </div>

          {/* Right: Text Content */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Convene</h2>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              Gather for Impact, Innovation, and Culture
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Discover and create meaningful gatherings that move the movement forward. From tech summits and investment forums to cultural celebrations—find where your community convenes.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-copper/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-dna-copper" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Diaspora Event Discovery</h3>
                  <p className="text-sm text-gray-600">Find events that align with your interests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-dna-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Community Gatherings</h3>
                  <p className="text-sm text-gray-600">Create and host your own events</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-dna-forest" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cultural Celebrations</h3>
                  <p className="text-sm text-gray-600">Connect through shared heritage and culture</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/convene')}
              className="bg-dna-copper hover:bg-dna-gold text-white inline-flex items-center gap-2"
            >
              Explore Events
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConveneSection;

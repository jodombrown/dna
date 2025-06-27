
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';

interface EventsTabProps {
  searchTerm: string;
}

const EventsTab: React.FC<EventsTabProps> = ({ searchTerm }) => {
  // Mock data for events with proper event logos and diverse African representation
  const events = [
    {
      id: '1',
      title: 'African Tech Leaders Summit 2024',
      description: 'Annual gathering of tech leaders driving innovation across Africa and the diaspora.',
      type: 'Conference',
      date: '2024-12-15',
      time: '09:00',
      location: 'Lagos, Nigeria',
      isVirtual: false,
      attendeeCount: 450,
      maxAttendees: 500,
      isFeatured: true,
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop', // Tech conference
      eventLogo: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=150&fit=crop', // Tech logo
      organizerImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face' // African tech professional
    },
    {
      id: '2',
      title: 'Diaspora Investment Forum',
      description: 'Connecting diaspora investors with African startups and impact opportunities.',
      type: 'Forum',
      date: '2025-01-22',
      time: '14:00',
      location: 'Virtual Event',
      isVirtual: true,
      attendeeCount: 280,
      maxAttendees: 300,
      isFeatured: true,
      bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop', // Business meeting
      eventLogo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&h=150&fit=crop', // Investment logo
      organizerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' // African business professional
    },
    {
      id: '3',
      title: 'Women in Finance Networking',
      description: 'Professional networking and mentorship event for African women in financial services.',
      type: 'Networking',
      date: '2024-12-28',
      time: '18:00',
      location: 'London, UK',
      isVirtual: false,
      attendeeCount: 120,
      maxAttendees: 150,
      isFeatured: false,
      bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=300&fit=crop', // Professional networking
      eventLogo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop', // Women leadership logo
      organizerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' // African woman professional
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {events.length} events {searchTerm && `matching "${searchTerm}"`}
        </p>
        <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative">
              <img
                src={event.bannerImage}
                alt={`${event.title} banner`}
                className="w-full h-48 object-cover"
              />
              {/* Event creator on banner - clickable */}
              <div className="absolute bottom-4 right-4">
                <button
                  className="rounded-full shadow border-2 border-white bg-white/90 hover:bg-dna-emerald/80 transition-all flex items-center gap-2 px-2 py-0.5"
                  title="View event creator profile"
                >
                  <img
                    src={event.organizerImage}
                    alt="Event creator"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-dna-forest">Creator</span>
                </button>
              </div>
              {/* Event logo - bottom left overlap */}
              <div className="absolute bottom-0 left-4 -mb-6 z-10">
                <img
                  src={event.eventLogo}
                  alt={`${event.title} logo`}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
              </div>
              {event.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-dna-gold text-white">
                  Featured
                </Badge>
              )}
            </div>
            
            <CardHeader className="pt-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{event.type}</Badge>
                    {event.isVirtual && (
                      <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
                    )}
                  </div>
                </div>
                <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                  Register
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-700">{event.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{event.attendeeCount}/{event.maxAttendees} attending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsTab;

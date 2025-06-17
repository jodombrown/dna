
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';

interface EventsTabProps {
  searchTerm: string;
}

const EventsTab: React.FC<EventsTabProps> = ({ searchTerm }) => {
  // Mock data for events with diverse African representation
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
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop',
      organizerImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face'
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
      bannerImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=300&fit=crop',
      organizerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
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
      bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=300&fit=crop',
      organizerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
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
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-4 right-4">
                <img
                  src={event.organizerImage}
                  alt="Event organizer"
                  className="w-12 h-12 rounded-full border-4 border-white object-cover"
                />
              </div>
              {event.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-dna-gold text-white">
                  Featured
                </Badge>
              )}
            </div>
            
            <CardHeader>
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

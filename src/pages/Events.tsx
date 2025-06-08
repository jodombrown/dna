import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
  is_virtual: boolean;
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const events: Event[] = [
    {
      id: '1',
      title: 'Global FinTech Summit 2025',
      description: 'Explore the future of finance with industry leaders and innovators.',
      date: '2025-07-15',
      location: 'New York, USA',
      type: 'Conference',
      is_virtual: false,
    },
    {
      id: '2',
      title: 'Diaspora Angel Investor Workshop',
      description: 'Learn how to invest in high-growth African startups.',
      date: '2025-08-01',
      location: 'Virtual',
      type: 'Workshop',
      is_virtual: true,
    },
    {
      id: '3',
      title: 'Women in Tech Africa Conference',
      description: 'Celebrating and empowering women in the African tech industry.',
      date: '2025-09-20',
      location: 'Nairobi, Kenya',
      type: 'Conference',
      is_virtual: false,
    },
    {
      id: '4',
      title: 'Sustainable Agriculture Forum',
      description: 'Discussing sustainable farming practices and food security solutions.',
      date: '2025-10-10',
      location: 'Accra, Ghana',
      type: 'Forum',
      is_virtual: false,
    },
    {
      id: '5',
      title: 'African Cultural Heritage Symposium',
      description: 'Preserving and promoting African cultural heritage through innovation.',
      date: '2025-11-05',
      location: 'Cairo, Egypt',
      type: 'Cultural',
      is_virtual: false,
    },
    {
      id: '6',
      title: 'Renewable Energy Tech Expo',
      description: 'Showcasing the latest renewable energy technologies for Africa.',
      date: '2025-12-01',
      location: 'Johannesburg, South Africa',
      type: 'Expo',
      is_virtual: false,
    },
  ];

  const eventTypes = ['All', 'Conference', 'Workshop', 'Forum', 'Cultural', 'Expo'];

  const filteredEvents = events.filter((event) => {
    const searchMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = selectedType === 'All' || event.type === selectedType;
    return searchMatch && typeMatch;
  });

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setIsRegisterDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-dna-emerald to-dna-forest py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl">
            Explore a variety of events designed to connect, inspire, and empower the African diaspora.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Label htmlFor="search" className="mr-2 text-gray-700 font-medium">
              Search:
            </Label>
            <Input
              type="text"
              id="search"
              placeholder="Search events..."
              className="max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <Label htmlFor="type" className="mr-2 text-gray-700 font-medium">
              Type:
            </Label>
            <select
              id="type"
              className="bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-dna-emerald focus:border-dna-emerald text-gray-700"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start mb-3">
                  <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                    {event.is_virtual && (
                      <Badge className="bg-dna-emerald hover:bg-dna-forest text-white text-xs">
                        Virtual
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <Button
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
                  onClick={() => handleRegisterClick(event)}
                >
                  Register
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-dna-forest">Event Registration - Coming Soon!</DialogTitle>
              <DialogDescription className="text-gray-600">
                We're preparing an exceptional event experience for the diaspora community.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-dna-emerald/5 rounded-lg p-4">
                <h4 className="font-medium text-dna-forest mb-2">
                  {selectedEvent?.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedEvent?.description}
                </p>
                <div className="text-sm text-dna-emerald font-medium">
                  {selectedEvent?.type} • {selectedEvent?.location}
                  {selectedEvent?.is_virtual && (
                    <Badge className="ml-2 bg-dna-emerald text-white text-xs">Virtual</Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">When event registration launches, you'll enjoy:</p>
                <ul className="space-y-1 text-sm ml-4">
                  <li>• Seamless event registration and calendar integration</li>
                  <li>• Pre-event networking with other attendees</li>
                  <li>• Access to event materials and recordings</li>
                  <li>• Follow-up collaboration opportunities</li>
                </ul>
              </div>
              <Button
                onClick={() => setIsRegisterDialogOpen(false)}
                className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
              >
                Stay Notified About Launch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Events;

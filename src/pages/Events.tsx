
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, Globe } from 'lucide-react';

const Events = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const events = [
    {
      id: 1,
      title: "African Tech Summit 2024",
      description: "The premier technology conference connecting African innovators with global opportunities",
      type: "conference",
      format: "hybrid",
      date: "March 15-17, 2024",
      time: "9:00 AM - 6:00 PM WAT",
      location: "Lagos, Nigeria + Virtual",
      attendees: "2,500+",
      price: "Free",
      speakers: ["Dr. Amina Hassan", "James Okoye", "Sarah Mwangi"],
      topics: ["AI & Innovation", "Fintech", "Sustainable Tech"],
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "Diaspora Investment Roundtable",
      description: "Exclusive roundtable discussion on African investment opportunities",
      type: "roundtable",
      format: "in-person",
      date: "March 28, 2024",
      time: "2:00 PM - 5:00 PM EST",
      location: "New York, NY",
      attendees: "50",
      price: "$150",
      speakers: ["Michael Adebayo", "Grace Kimani"],
      topics: ["Investment Strategies", "Market Analysis", "Due Diligence"],
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Women in African Business Webinar",
      description: "Empowering women entrepreneurs across the African continent",
      type: "webinar",
      format: "virtual",
      date: "April 5, 2024",
      time: "7:00 PM - 8:30 PM GMT",
      location: "Virtual",
      attendees: "1,000+",
      price: "Free",
      speakers: ["Fatima Al-Rashid", "Kemi Ogundepo"],
      topics: ["Leadership", "Funding", "Scaling"],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Innovation Pitch Night",
      description: "Showcase your startup to a panel of diaspora investors and mentors",
      type: "pitch",
      format: "hybrid",
      date: "April 12, 2024",
      time: "6:00 PM - 9:00 PM GMT",
      location: "London, UK + Virtual",
      attendees: "200",
      price: "$75",
      speakers: ["Panel of Investors"],
      topics: ["Startup Pitches", "Funding", "Mentorship"],
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop"
    }
  ];

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'conference', label: 'Conferences' },
    { id: 'webinar', label: 'Webinars' },
    { id: 'roundtable', label: 'Roundtables' },
    { id: 'pitch', label: 'Pitch Events' }
  ];

  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(event => event.type === selectedFilter);

  const handleRegister = (eventId: number) => {
    console.log('Registering for event:', eventId);
    // Here you would implement the registration logic
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'virtual':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming <span className="text-dna-copper">Events</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect, learn, and collaborate at events designed to strengthen the African diaspora network
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              onClick={() => setSelectedFilter(filter.id)}
              className={selectedFilter === filter.id ? "bg-dna-copper hover:bg-dna-gold" : ""}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-dna-emerald text-white">
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/90">
                    {event.price}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                <p className="text-gray-600">{event.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    {getFormatIcon(event.format)}
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.attendees} attendees
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Featured Topics:</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.topics.map((topic, index) => (
                      <Badge key={index} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Speakers:</h4>
                  <p className="text-sm text-gray-600">
                    {event.speakers.join(', ')}
                  </p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1 bg-dna-copper hover:bg-dna-gold"
                    onClick={() => handleRegister(event.id)}
                  >
                    Register Now
                  </Button>
                  <Button variant="outline">
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-dna-emerald to-dna-forest text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Host Your Own Event</h3>
              <p className="text-lg mb-6">
                Want to organize an event for the DNA community? We provide platform support and promotion.
              </p>
              <Button size="lg" className="bg-white text-dna-forest hover:bg-gray-100">
                Propose an Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Events;

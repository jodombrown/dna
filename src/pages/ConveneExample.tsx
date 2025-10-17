import React from 'react';
import { Calendar, MapPin, Users, Video, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';

const ConveneExample = () => {
  const upcomingEvents = [
    {
      title: 'African Tech Summit 2025',
      date: 'March 15, 2025',
      time: '10:00 AM GMT',
      location: 'Nairobi, Kenya',
      type: 'In-Person',
      attendees: 250,
      category: 'Technology'
    },
    {
      title: 'Diaspora Investment Forum',
      date: 'March 22, 2025',
      time: '2:00 PM EST',
      location: 'Virtual',
      type: 'Virtual',
      attendees: 500,
      category: 'Finance'
    },
    {
      title: 'Healthcare Innovation Workshop',
      date: 'April 5, 2025',
      time: '9:00 AM WAT',
      location: 'Lagos, Nigeria',
      type: 'Hybrid',
      attendees: 150,
      category: 'Healthcare'
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Regional Events',
      description: 'Discover and attend events across Africa and the diaspora'
    },
    {
      icon: Video,
      title: 'Virtual & Hybrid',
      description: 'Join from anywhere with virtual and hybrid event options'
    },
    {
      icon: Users,
      title: 'Community Gatherings',
      description: 'Connect with professionals in your region and industry'
    },
    {
      icon: TrendingUp,
      title: 'Impact Tracking',
      description: 'See the outcomes and impact of community gatherings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-dna-emerald text-white">
              Convene
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-dna-forest via-dna-emerald to-dna-copper bg-clip-text text-transparent">
              Gather. Connect. Transform.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Bring together the diaspora through meaningful events, forums, and gatherings 
              that spark collaboration and drive Africa's development.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-dna-emerald/20 hover:border-dna-emerald/40 transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-dna-emerald/10 rounded-lg mb-4">
                      <feature.icon className="h-6 w-6 text-dna-emerald" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="bg-dna-forest text-white">
                        {event.category}
                      </Badge>
                      <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                        {event.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                      <Button className="w-full mt-4 bg-dna-emerald hover:bg-dna-emerald/90">
                        Register Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-dna-forest to-dna-emerald text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to host your own event?</h3>
              <p className="mb-6 text-white/90">
                Create meaningful gatherings that bring the diaspora together and drive impact.
              </p>
              <Button variant="secondary" size="lg" className="bg-white text-dna-forest hover:bg-white/90">
                Create Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConveneExample;

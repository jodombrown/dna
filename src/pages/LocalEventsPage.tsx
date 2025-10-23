import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin,
  Navigation,
  Map,
  Clock,
  Users,
  Search,
  Bell,
  Calendar,
  Globe2,
  TrendingUp,
  Heart,
  Home
} from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const LocalEventsPage = () => {
  useScrollToTop();
  const navigate = useNavigate();

  const benefits = [
    {
      icon: MapPin,
      title: 'Find Events Near You',
      description: 'Automatically discover events happening in your neighborhood, city, and surrounding areas based on your current location'
    },
    {
      icon: Clock,
      title: 'Save Time & Energy',
      description: 'No more endless scrolling through irrelevant events. See only what\'s happening close to you, making it easy to attend in person'
    },
    {
      icon: Users,
      title: 'Build Local Connections',
      description: 'Meet diaspora community members who live nearby. Build meaningful relationships with people you can actually connect with regularly'
    },
    {
      icon: Home,
      title: 'Support Your Community',
      description: 'Discover and support local organizers, small businesses, and community initiatives happening right in your area'
    },
    {
      icon: Navigation,
      title: 'Smart Distance Filtering',
      description: 'Set your preferred travel radius - see events within 5 miles, 20 miles, or expand to your whole metro area'
    },
    {
      icon: Bell,
      title: 'Location-Based Alerts',
      description: 'Get notified when new events are added in your area so you never miss local opportunities to connect'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Set Your Location',
      description: 'Share your location or manually enter your city. Your privacy is protected - we only use it to show nearby events.',
      icon: MapPin
    },
    {
      step: '2',
      title: 'Choose Your Radius',
      description: 'Select how far you\'re willing to travel - from your immediate neighborhood to your entire metro region.',
      icon: Navigation
    },
    {
      step: '3',
      title: 'Browse Local Events',
      description: 'See events organized by distance, with the closest ones first. Filter by date, type, and your interests.',
      icon: Search
    },
    {
      step: '4',
      title: 'Connect & Attend',
      description: 'RSVP to events, coordinate with other local attendees, and build your community network.',
      icon: Users
    }
  ];

  const locationLevels = [
    {
      title: 'Hyper-Local',
      distance: 'Within 5 miles',
      icon: Home,
      examples: [
        'Neighborhood meetups',
        'Local coffee shop gatherings',
        'Community board meetings',
        'Walking-distance events'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'City-Wide',
      distance: 'Within 20 miles',
      icon: Map,
      examples: [
        'City festivals and celebrations',
        'Professional networking events',
        'Cultural performances',
        'Workshops and classes'
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Metro Area',
      distance: 'Within 50+ miles',
      icon: Globe2,
      examples: [
        'Regional conferences',
        'Major cultural events',
        'Large-scale gatherings',
        'Special occasion celebrations'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const sampleCities = [
    { city: 'New York', count: '450+', flag: '🇺🇸' },
    { city: 'London', count: '320+', flag: '🇬🇧' },
    { city: 'Lagos', count: '280+', flag: '🇳🇬' },
    { city: 'Toronto', count: '190+', flag: '🇨🇦' },
    { city: 'Johannesburg', count: '240+', flag: '🇿🇦' },
    { city: 'Paris', count: '210+', flag: '🇫🇷' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/convene')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-12 md:p-16 text-white mb-12">
          <div className="relative z-10 max-w-4xl">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 mb-6 text-base px-4 py-2">
              <MapPin className="h-4 w-4 mr-2" />
              Local Events Discovery
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Community.<br />Right Where You Are.
            </h1>
            <p className="text-xl md:text-2xl opacity-95 mb-8 leading-relaxed">
              Stop missing out on amazing events happening just around the corner. 
              Discover diaspora gatherings in your neighborhood, city, and region - all automatically filtered by distance from you.
            </p>
            <div className="flex flex-wrap gap-8 text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                <span className="font-semibold">200+ Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span className="font-semibold">5,000+ Local Events</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <span className="font-semibold">Built for Community</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl -z-0" />
        </div>

        {/* The Problem */}
        <Card className="p-8 md:p-12 mb-12 bg-gradient-to-br from-muted/50 to-muted/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Local Matters</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-destructive">The Problem</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                  <span>You see events happening across the world, but nothing in your own city</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                  <span>Scrolling through hundreds of irrelevant events wastes your time</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                  <span>You miss community gatherings because you didn't know they existed</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                  <span>Hard to find diaspora events specific to your local area</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary">The Solution</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Automatically see events near you first, organized by distance</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Set your preferred travel radius to only see what's convenient</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Get alerts when new local events are added to the platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Connect with diaspora community members who live nearby</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Benefits Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Why You'll Love Local Events</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Location Levels */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-3 text-center">Choose Your Discovery Radius</h2>
          <p className="text-center text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Control how far you want to explore. Switch between hyper-local, city-wide, or metro area views anytime.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {locationLevels.map((level, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all group">
                <div className={`h-32 bg-gradient-to-br ${level.color} p-6 text-white flex items-center justify-center`}>
                  <level.icon className="h-16 w-16" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {level.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 font-semibold">
                    {level.distance}
                  </p>
                  <p className="text-muted-foreground mb-4">Perfect for:</p>
                  <ul className="space-y-2">
                    {level.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-3 text-center">How It Works</h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            Four simple steps to start discovering events in your area
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {step.step}
                    </div>
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sample Cities */}
        <Card className="p-8 md:p-12 mb-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-3xl font-bold mb-3 text-center">Events in Major Cities</h2>
          <p className="text-center text-muted-foreground text-lg mb-8">
            The diaspora is everywhere. Here's a snapshot of events in some of our top cities:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sampleCities.map((city, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="text-4xl mb-3">{city.flag}</div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                  {city.city}
                </h3>
                <p className="text-sm text-muted-foreground font-semibold">{city.count} events</p>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8">
            + 194 more cities across 6 continents
          </p>
        </Card>

        {/* Real-World Use Cases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Real-World Scenarios</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">New to the City</h3>
                  <p className="text-muted-foreground">
                    "I just moved to Atlanta and want to meet other young professionals from the diaspora. 
                    Local events helped me find weekly meetups within walking distance of my apartment."
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Busy Parent</h3>
                  <p className="text-muted-foreground">
                    "With two kids, I can't travel far. The local filter shows me family-friendly cultural events 
                    within 10 miles, so we can participate without the hassle."
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Community Builder</h3>
                  <p className="text-muted-foreground">
                    "I organize neighborhood events and use local discovery to see what's already happening nearby. 
                    It helps me coordinate and avoid scheduling conflicts."
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Weekend Explorer</h3>
                  <p className="text-muted-foreground">
                    "Every Friday I check what's happening this weekend within 30 miles. 
                    I've discovered amazing festivals and gatherings I never would have found otherwise."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-12 text-center bg-gradient-to-br from-primary to-primary/80 text-white">
          <h2 className="text-4xl font-bold mb-4">Your Community Is Waiting</h2>
          <p className="text-xl opacity-95 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the DNA platform when we launch and start discovering the vibrant diaspora 
            community right in your neighborhood. Connection starts close to home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/convene')}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
            >
              Explore More Features
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
            >
              Join the Waitlist
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default LocalEventsPage;

import React, { useState } from 'react';
import { Calendar, MapPin, Users, Video, Clock, TrendingUp, Filter, Sparkles } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import FeedbackPanel from '@/components/FeedbackPanel';
import PageSpecificSurvey from '@/components/survey/PageSpecificSurvey';
import { useConveneLogic } from '@/hooks/useConveneLogic';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ConveneExample = () => {
  useScrollToTop();
  const {
    upcomingEvents,
    stats,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isRegisterDialogOpen,
    setIsRegisterDialogOpen,
    isCreateEventDialogOpen,
    setIsCreateEventDialogOpen,
    selectedEvent,
    handleRegister,
    filterType,
    setFilterType,
    filterCategory,
    setFilterCategory
  } = useConveneLogic();

  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 bg-gradient-to-br from-dna-emerald/5 via-background to-dna-forest/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-dna-emerald text-white">
              Convene
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-dna-forest via-dna-emerald to-dna-copper bg-clip-text text-transparent">
              Gather. Connect. Transform.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Bring together the diaspora through meaningful events, forums, and gatherings 
              that spark collaboration and drive Africa's development.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-emerald mb-1">{stats.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-copper mb-1">{stats.totalAttendees.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Attendees</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-forest mb-1">{stats.countriesReached}</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-gold mb-1">{stats.upcomingEvents}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>
          </div>


        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <EnhancedCard key={index} hover className="border-dna-emerald/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-dna-emerald/10 rounded-lg mb-4">
                    <feature.icon className="h-6 w-6 text-dna-emerald" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </EnhancedCard>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="In-Person">In-Person</SelectItem>
              <SelectItem value="Virtual">Virtual</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Energy">Energy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <EnhancedButton 
              variant="dna" 
              onClick={() => setIsCreateEventDialogOpen(true)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create Event
            </EnhancedButton>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EnhancedCard key={event.id} hover>
                {event.featured && (
                  <div className="bg-gradient-to-r from-dna-gold to-dna-copper text-white text-xs font-bold py-1 px-3 text-center">
                    FEATURED
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-dna-forest text-white">
                      {event.category}
                    </Badge>
                    <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                      {event.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
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
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                      {event.spotsLeft && event.spotsLeft < 50 && (
                        <span className="text-dna-copper font-medium">{event.spotsLeft} spots left</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold text-dna-emerald">{event.price}</span>
                    </div>
                    <EnhancedButton 
                      className="w-full" 
                      variant="default"
                      onClick={() => handleRegister(event)}
                    >
                      Register Now
                    </EnhancedButton>
                  </div>
                </CardContent>
              </EnhancedCard>
            ))}
          </div>
        </div>

        {/* Page-specific Survey CTA */}
        <div className="mt-12 bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-emerald/20">
          <h3 className="text-2xl font-bold text-dna-forest mb-4">
            Help Us Improve Event Experiences
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your thoughts on diaspora gatherings and networking events. 
            Your feedback will shape how we bring the community together.
          </p>
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Share Your Convene Experience
          </button>
        </div>
      </main>

      <Footer />

      {/* Registration Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Complete your registration for this event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{selectedEvent?.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">{selectedEvent?.time}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{selectedEvent?.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-medium">{selectedEvent?.price}</p>
              </div>
            </div>
            <div className="pt-4">
              <EnhancedButton className="w-full" size="lg">
                Confirm Registration
              </EnhancedButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventDialogOpen} onOpenChange={setIsCreateEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Organize a gathering to bring the diaspora together
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Event creation feature coming soon!</p>
            <EnhancedButton variant="outline" onClick={() => setIsCreateEventDialogOpen(false)}>
              Close
            </EnhancedButton>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="convene"
      />
      
      <PageSpecificSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageType="convene"
      />
    </div>
  );
};

export default ConveneExample;

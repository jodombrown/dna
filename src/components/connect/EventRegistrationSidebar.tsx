
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ExternalLink, Instagram, Linkedin, Link, MessageSquare, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Event } from '@/types/search';

interface EventRegistrationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onRegister: () => void;
  onCreatorClick?: (creatorId: string) => void;
}

const EventRegistrationSidebar: React.FC<EventRegistrationSidebarProps> = ({
  open,
  onOpenChange,
  event,
  onRegister,
  onCreatorClick
}) => {
  const [demoExplanationOpen, setDemoExplanationOpen] = React.useState(false);
  const [contactHostDialogOpen, setContactHostDialogOpen] = React.useState(false);
  const [reportEventDialogOpen, setReportEventDialogOpen] = React.useState(false);

  if (!event) return null;

  const getEventBanner = (eventTitle: string) => {
    if (eventTitle.toLowerCase().includes('tech') || eventTitle.toLowerCase().includes('innovation')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('investment') || eventTitle.toLowerCase().includes('finance')) {
      return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop';
    }
    if (eventTitle.toLowerCase().includes('women') || eventTitle.toLowerCase().includes('networking')) {
      return 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
  };

  const eventBanner = event.banner_url || getEventBanner(event.title);

  // Update dates to July 2025 and beyond
  const getUpdatedEventDate = (eventTitle: string) => {
    if (eventTitle === "African Tech Summit 2024") {
      return new Date('2025-07-15T09:00:00');
    }
    if (eventTitle.toLowerCase().includes('investment')) {
      return new Date('2025-08-20T10:00:00');
    }
    if (eventTitle.toLowerCase().includes('women')) {
      return new Date('2025-09-12T14:00:00');
    }
    if (eventTitle.toLowerCase().includes('health')) {
      return new Date('2025-10-08T11:00:00');
    }
    return new Date('2025-07-25T15:00:00');
  };

  const eventDate = getUpdatedEventDate(event.title);

  const handleRegisterClick = () => {
    setDemoExplanationOpen(true);
  };

  const getGoogleMapsEmbedUrl = (location: string) => {
    // For demo purposes, we'll use specific locations for each event
    if (event.title === "African Tech Summit 2024") {
      return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.2847474!2d-0.1419!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b2!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1234567890";
    }
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.2847474!2d-0.1419!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b2!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1234567890";
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-lg p-0 overflow-y-auto shadow-2xl border-l-4 border-dna-emerald"
          style={{ 
            boxShadow: '-8px 0 24px -4px rgba(0, 0, 0, 0.1), -4px 0 8px -2px rgba(0, 0, 0, 0.06)' 
          }}
        >
          <div className="flex flex-col h-full">
            {/* Hero Section */}
            <div className="relative">
              <img
                src={eventBanner}
                alt={event.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Virtual badge */}
              {event.is_virtual && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-dna-emerald text-white border-0">
                    Virtual
                  </Badge>
                </div>
              )}
              
              {/* Title overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
                <div className="flex items-center gap-2 text-white/90">
                  <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                    {event.type}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-8">
              {/* Get Tickets Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Get Tickets</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Registration closes in 5 days</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Secure your spot before it's too late!
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900">Free</div>
                  <div className="text-sm text-gray-600">Per ticket</div>
                </div>

                <Button 
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white font-medium py-3 text-lg"
                  onClick={handleRegisterClick}
                >
                  Register Now
                </Button>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-dna-emerald" />
                  <div>
                    <div className="font-medium">
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {eventDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-dna-emerald" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Users className="w-5 h-5 text-dna-emerald" />
                  <div>
                    <div className="font-medium">{event.attendee_count} attending</div>
                    {event.max_attendees && (
                      <div className="text-sm text-gray-500">
                        {event.max_attendees - event.attendee_count} spots remaining
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* About Event */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">About Event</h3>
                <p className="text-gray-600 leading-relaxed">
                  {event.description || "Join us for an incredible event that brings together the best minds in the African diaspora. This is your opportunity to network, learn, and contribute to meaningful conversations that shape our future."}
                </p>
                
                {event.title === "African Tech Summit 2024" && (
                  <div className="space-y-3 text-gray-600">
                    <p>
                      The premier technology conference bringing together African innovators, entrepreneurs, and tech leaders from around the world. 
                      Experience three days of inspiring keynotes, interactive workshops, and unparalleled networking opportunities.
                    </p>
                    <p>
                      Whether you're a startup founder, seasoned tech executive, or aspiring innovator, this summit offers valuable insights 
                      into the latest trends, emerging technologies, and investment opportunities across the African tech ecosystem.
                    </p>
                  </div>
                )}
              </div>

              {/* Location with Google Maps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="font-medium text-gray-900">{event.location}</div>
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <iframe
                      src={getGoogleMapsEmbedUrl(event.location)}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map showing ${event.location}`}
                    />
                  </div>
                </div>
              </div>

              {/* Presented By */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Presented by</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.open('https://diasporanetworkafrica.com', '_blank')}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src="/lovable-uploads/c6f51307-c7df-4a26-a66e-b99e88b55c53.png" 
                      alt="DNA Logo" 
                      className="w-12 h-12 rounded-lg object-contain"
                    />
                  </button>
                  <div>
                    <div className="font-medium text-gray-900">Diaspora Network of Africa</div>
                    <div className="text-sm text-gray-600">#1 Professional Networking and Impact Investment Platform for the African Diaspora</div>
                  </div>
                </div>
              </div>

              {/* Hosted By */}
              {event.creator_profile && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Hosted By</h3>
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onCreatorClick?.(event.creator_profile!.id)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={event.creator_profile.avatar_url} alt={event.creator_profile.full_name} />
                      <AvatarFallback className="bg-dna-copper text-white">
                        {event.creator_profile.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{event.creator_profile.full_name}</div>
                      <div className="text-sm text-gray-600">Event Host</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Contact & Actions */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2"
                    onClick={() => setContactHostDialogOpen(true)}
                  >
                    <span>Contact the Host</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start gap-2 text-red-600 hover:text-red-700"
                    onClick={() => setReportEventDialogOpen(true)}
                  >
                    <span>Report Event</span>
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4 pb-6">
                <h3 className="text-lg font-semibold text-gray-900">Follow {event.title}</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-pink-50 hover:border-pink-200"
                    onClick={() => window.open('https://www.instagram.com/diasporanetwork.africa', '_blank')}
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => window.open('https://www.linkedin.com/company/diasporanetworkafrica', '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-orange-50 hover:border-orange-200"
                    onClick={() => window.open('https://www.reddit.com/r/diasporanetworkafrica/', '_blank')}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                      </svg>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-green-50 hover:border-green-200"
                    onClick={() => window.open('https://wa.me/message/XXXXXXXXXX', '_blank')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="hover:bg-gray-50"
                    onClick={() => window.open('https://diasporanetworkafrica.com', '_blank')}
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Demo Explanation Dialog */}
      <Dialog open={demoExplanationOpen} onOpenChange={setDemoExplanationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Event Registration - DNA Platform Demo
              <button
                onClick={() => setDemoExplanationOpen(false)}
                className="bg-dna-copper text-white rounded-full p-1.5 hover:bg-dna-copper/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Welcome to DNA's event registration experience! This demo showcases how seamless event discovery and registration will be on our platform.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">What you're experiencing:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Comprehensive event details and venue information</li>
                  <li>• Direct connection to event hosts and organizers</li>  
                  <li>• Integration with DNA's professional network</li>
                  <li>• Streamlined registration for diaspora-focused events</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">In our live platform, you'll have:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Real-time event registration and payment processing</li>
                  <li>• Calendar integration and event reminders</li>
                  <li>• Networking opportunities with other attendees</li>
                  <li>• Post-event collaboration and follow-up tools</li>
                  <li>• Impact tracking for diaspora community events</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Host Dialog */}
      <Dialog open={contactHostDialogOpen} onOpenChange={setContactHostDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact the Host - Demo Feature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              This feature allows you to reach out directly to event organizers for questions, partnership opportunities, or special requests.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">How it works:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Send direct messages through our secure platform</li>
                  <li>• Share your professional background and interests</li>
                  <li>• Request speaking opportunities or sponsorship info</li>
                  <li>• Ask about accessibility accommodations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Why contact hosts:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Network before the event begins</li>
                  <li>• Explore collaboration opportunities</li>
                  <li>• Get insider insights about the agenda</li>
                  <li>• Build meaningful professional relationships</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => setContactHostDialogOpen(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Event Dialog */}
      <Dialog open={reportEventDialogOpen} onOpenChange={setReportEventDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Event - Community Safety</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Help us maintain a safe and professional environment by reporting events that violate our community standards.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">When to report:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Misleading or fraudulent event information</li>
                  <li>• Inappropriate content or discrimination</li>
                  <li>• Spam or unrelated commercial promotion</li>
                  <li>• Safety concerns or suspicious activity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">What happens next:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Our team reviews all reports within 24 hours</li>
                  <li>• We investigate and take appropriate action</li>
                  <li>• You'll receive updates on the resolution</li>
                  <li>• Reporter identity remains confidential</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => setReportEventDialogOpen(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventRegistrationSidebar;


import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, ExternalLink, Instagram, Linkedin, Link } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
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
                onClick={onRegister}
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
                    {event.date_time ? new Date(event.date_time).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    }) : 'Date TBD'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.date_time ? new Date(event.date_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }) : 'Time TBD'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-dna-emerald" />
                <div>
                  <div className="font-medium">{event.location}</div>
                  {!event.is_virtual && (
                    <div className="text-sm text-gray-500">Register to see full address</div>
                  )}
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

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{event.location}</div>
                {!event.is_virtual && (
                  <div className="text-sm text-gray-600 mt-1">
                    Please register to see the exact location of this event.
                  </div>
                )}
              </div>
            </div>

            {/* Presented By */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Presented by</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-dna-emerald rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DNA</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Diaspora Network of Africa</div>
                  <div className="text-sm text-gray-600">Professional platform for the African Diaspora</div>
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
                <Button variant="outline" className="justify-start gap-2">
                  <span>Contact the Host</span>
                </Button>
                <Button variant="outline" className="justify-start gap-2 text-red-600 hover:text-red-700">
                  <span>Report Event</span>
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4 pb-6">
              <h3 className="text-lg font-semibold text-gray-900">Follow Event</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="hover:bg-pink-50 hover:border-pink-200">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-200">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="hover:bg-gray-50">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventRegistrationSidebar;

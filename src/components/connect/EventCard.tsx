
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users as UsersIcon, Image as ImageIcon } from 'lucide-react';
import { Event } from '@/types/search';
import ConnectDialogs from './ConnectDialogs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: Event;
  onRegister: () => void;
  isLoggedIn: boolean;
  onClick?: () => void;
}

// Updated placeholder images with diverse African representation
const PLACEHOLDER_BANNER =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?fit=crop&w=700&q=80";
const PLACEHOLDER_PROFILE =
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?fit=crop&w=128&q=80";

// Event organizer images - diverse African professionals
const getEventOrganizerImage = (eventTitle: string) => {
  const organizerImages: { [key: string]: string } = {
    'African Tech Leaders Summit': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    'Diaspora Investment Forum': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'Women in Finance Networking': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'Climate Solutions Showcase': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'Healthcare Innovation': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'AgriTech Innovation': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face'
  };

  // Find matching organizer image based on event title keywords
  for (const [keyword, image] of Object.entries(organizerImages)) {
    if (eventTitle.includes(keyword)) {
      return image;
    }
  }

  // Default to first image if no match found
  return 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face';
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  onRegister,
  isLoggedIn,
  onClick,
}) => {
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoggedIn) {
      onRegister();
    } else {
      setIsRegisterEventDialogOpen(true);
    }
  };

  const organizerImage = event.creator_profile?.avatar_url || getEventOrganizerImage(event.title);

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer p-0 flex flex-col overflow-hidden"
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-label={`View event: ${event.title}`}
      >
        {/* Banner image */}
        <div
          className="h-32 sm:h-40 w-full bg-gray-200 relative group"
          style={{ backgroundColor: "#f4f6f4" }}
        >
          <img
            src={event.banner_url || PLACEHOLDER_BANNER}
            alt={`${event.title} banner`}
            className="w-full h-full object-cover object-center transition-transform group-hover:scale-105 duration-300"
            loading="lazy"
          />
          {/* Creator avatar bottom-right on banner */}
          {event.creator_profile && (
            <button
              className="absolute bottom-2 right-2 rounded-full shadow border-2 border-white bg-white/80 hover:bg-dna-emerald/80 transition-all flex items-center gap-2 px-2 py-0.5 z-20"
              onClick={e => {
                e.stopPropagation();
                navigate(`/profile/${event.creator_profile.id}`);
              }}
              title={`View profile: ${event.creator_profile.full_name}`}
              aria-label="View event creator profile"
              tabIndex={0}
              type="button"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={organizerImage} alt={event.creator_profile.full_name} />
                <AvatarFallback className="bg-dna-copper text-white">
                  <ImageIcon className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-dna-forest opacity-90 max-w-[6em] truncate">{event.creator_profile.full_name}</span>
            </button>
          )}

          {/* Profile image avatar - overlap bottom left */}
          <div className="absolute bottom-0 left-3 -mb-6 z-10">
            <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg bg-white">
              <AvatarImage
                src={event.image_url || organizerImage}
                alt={event.title}
                className="object-cover"
              />
              <AvatarFallback className="bg-dna-copper text-white">
                <ImageIcon className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        {/* Card content - titled/info, padding top for avatar overlap */}
        <CardHeader className="pt-8 pb-2">
          <CardTitle className="text-base font-semibold">{event.title}</CardTitle>
          <div className="flex gap-2 flex-wrap mt-1">
            <Badge variant="outline">{event.type}</Badge>
            {event.is_virtual && (
              <Badge variant="secondary" className="cursor-default">Virtual</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</div>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-4 h-4" />
              {event.date_time ? new Date(event.date_time).toLocaleString() : 'TBD'}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <UsersIcon className="w-4 h-4" />
              {event.attendee_count ?? 0} attending
            </div>
          </div>
          <Button
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            onClick={handleRegisterClick}
          >
            Register
          </Button>
        </CardContent>
      </Card>

      <ConnectDialogs
        isConnectDialogOpen={false}
        setIsConnectDialogOpen={() => {}}
        isMessageDialogOpen={false}
        setIsMessageDialogOpen={() => {}}
        isJoinCommunityDialogOpen={false}
        setIsJoinCommunityDialogOpen={() => {}}
        isRegisterEventDialogOpen={isRegisterEventDialogOpen}
        setIsRegisterEventDialogOpen={setIsRegisterEventDialogOpen}
      />
    </>
  );
};

export default EventCard;

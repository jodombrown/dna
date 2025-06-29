
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';
import { Event } from '@/types/search';

interface EventHostSectionProps {
  event: Event;
  onCreatorClick?: (creatorId: string) => void;
}

const EventHostSection: React.FC<EventHostSectionProps> = ({ event, onCreatorClick }) => {
  if (!event.creator_profile) return null;

  return (
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
  );
};

export default EventHostSection;

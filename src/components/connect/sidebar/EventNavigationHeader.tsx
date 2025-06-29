
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { Event } from '@/types/search';
import { useToast } from '@/hooks/use-toast';

interface EventNavigationHeaderProps {
  event: Event;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const EventNavigationHeader: React.FC<EventNavigationHeaderProps> = ({
  event,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true
}) => {
  const { toast } = useToast();

  const generateEventLink = (event: Event) => {
    // Generate a DNA-style event link similar to Luma's format
    const eventSlug = event.title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    const eventId = event.id.substring(0, 8);
    return `https://diasporanetworkafrica.com/events/${eventSlug}-${eventId}`;
  };

  const handleCopyLink = async () => {
    const eventLink = generateEventLink(event);
    try {
      await navigator.clipboard.writeText(eventLink);
      toast({
        title: "Link Copied!",
        description: "Event link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEventPageClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "In our MVP, this will take you to a dedicated event page with comprehensive details, networking opportunities, and enhanced interaction features.",
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
      {/* Left side - Navigation arrows */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onNext}
          disabled={!hasNext}
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
          onClick={handleCopyLink}
        >
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
          onClick={handleEventPageClick}
        >
          Event Page
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EventNavigationHeader;

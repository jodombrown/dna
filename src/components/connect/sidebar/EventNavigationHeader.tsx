
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Copy, ExternalLink, X } from 'lucide-react';
import { Event } from '@/types/search';
import { useToast } from '@/hooks/use-toast';

interface EventNavigationHeaderProps {
  event: Event;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onClose?: () => void;
}

const EventNavigationHeader: React.FC<EventNavigationHeaderProps> = ({
  event,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
  onClose
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
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-[100] shadow-sm">
      {/* Navigation arrows - evenly spaced */}
      <div className="flex items-center gap-1 flex-1 justify-start">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onNext}
          disabled={!hasNext}
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

      {/* Action buttons - center */}
      <div className="flex items-center gap-2 flex-1 justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
          onClick={handleCopyLink}
        >
          <Copy className="h-3 w-3" />
          Copy Link
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
          onClick={handleEventPageClick}
        >
          Event Page
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Close button - right */}
      <div className="flex-1 justify-end flex">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </div>
  );
};

export default EventNavigationHeader;

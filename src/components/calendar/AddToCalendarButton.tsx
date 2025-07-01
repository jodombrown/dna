
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarPlus, Calendar, Download, ExternalLink } from 'lucide-react';
import { generateCalendarUrls, CalendarEvent } from '@/utils/calendarUtils';
import { toast } from 'sonner';

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  event,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCalendarAction = (action: 'google' | 'outlook' | 'ics') => {
    const urls = generateCalendarUrls(event);
    
    switch (action) {
      case 'google':
        window.open(urls.google, '_blank');
        toast.success('Opening Google Calendar...');
        break;
      case 'outlook':
        window.open(urls.outlook, '_blank');
        toast.success('Opening Outlook Calendar...');
        break;
      case 'ics':
        urls.downloadICS();
        toast.success('Calendar file downloaded!');
        break;
    }
    
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`flex items-center gap-2 ${className}`}
        >
          <CalendarPlus className="w-4 h-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleCalendarAction('google')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-blue-600" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleCalendarAction('outlook')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-blue-700" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleCalendarAction('ics')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-dna-emerald" />
          Download (.ics)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToCalendarButton;

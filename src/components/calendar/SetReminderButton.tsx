
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Clock, AlertCircle } from 'lucide-react';
import { createReminderEvent } from '@/utils/calendarUtils';
import { toast } from 'sonner';

interface SetReminderButtonProps {
  title: string;
  date: Date;
  description?: string;
  type?: 'deadline' | 'followup' | 'meeting';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const SetReminderButton: React.FC<SetReminderButtonProps> = ({
  title,
  date,
  description,
  type = 'followup',
  variant = 'ghost',
  size = 'sm',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleReminderAction = (action: 'google' | 'outlook' | 'ics') => {
    const urls = createReminderEvent(title, date, description, type);
    
    switch (action) {
      case 'google':
        window.open(urls.google, '_blank');
        toast.success('Reminder added to Google Calendar!');
        break;
      case 'outlook':
        window.open(urls.outlook, '_blank');
        toast.success('Reminder added to Outlook!');
        break;
      case 'ics':
        urls.downloadICS();
        toast.success('Reminder file downloaded!');
        break;
    }
    
    setIsOpen(false);
  };

  const getIcon = () => {
    switch (type) {
      case 'deadline':
        return <AlertCircle className="w-4 h-4" />;
      case 'meeting':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`flex items-center gap-2 ${className}`}
        >
          {getIcon()}
          Set Reminder
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleReminderAction('google')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Bell className="w-4 h-4 text-blue-600" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleReminderAction('outlook')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Clock className="w-4 h-4 text-blue-700" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleReminderAction('ics')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <AlertCircle className="w-4 h-4 text-dna-emerald" />
          Download Reminder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SetReminderButton;


import { format } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  url?: string;
}

export const generateCalendarUrls = (event: CalendarEvent) => {
  const { title, description, startDate, endDate, location } = event;
  
  // Format dates for different calendar formats
  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const formatDateForICS = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Google Calendar URL
  const googleParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    details: description || '',
    location: location || '',
  });
  
  const googleUrl = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

  // Outlook URL
  const outlookParams = new URLSearchParams({
    subject: title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: description || '',
    location: location || '',
  });
  
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

  // Generate ICS file content
  const generateICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DNA Platform//Event Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@dnaplatform.com`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description}` : '',
      location ? `LOCATION:${location}` : '',
      `DTSTAMP:${formatDateForICS(new Date())}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');
    
    return icsContent;
  };

  return {
    google: googleUrl,
    outlook: outlookUrl,
    ics: generateICS(),
    downloadICS: () => {
      const blob = new Blob([generateICS()], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
};

export const createReminderEvent = (
  title: string, 
  date: Date, 
  description?: string,
  type: 'deadline' | 'followup' | 'meeting' = 'followup'
) => {
  const reminderDate = new Date(date);
  const endDate = new Date(date.getTime() + (60 * 60 * 1000)); // 1 hour duration
  
  const reminderEvent: CalendarEvent = {
    id: `reminder-${Date.now()}`,
    title: `${type === 'deadline' ? '📅' : type === 'meeting' ? '🤝' : '🔔'} ${title}`,
    description: description || `Reminder for: ${title}`,
    startDate: reminderDate,
    endDate: endDate,
  };
  
  return generateCalendarUrls(reminderEvent);
};

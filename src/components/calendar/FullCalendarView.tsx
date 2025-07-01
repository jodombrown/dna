
import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Users, Video, ExternalLink } from 'lucide-react';
import { Event } from '@/types/search';
import AddToCalendarButton from './AddToCalendarButton';
import { CalendarEvent } from '@/utils/calendarUtils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface FullCalendarViewProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
  onEventRegister?: (event: Event) => void;
  className?: string;
}

const FullCalendarView: React.FC<FullCalendarViewProps> = ({
  events,
  onEventSelect,
  onEventRegister,
  className = ''
}) => {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Transform events for react-big-calendar
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      const startDate = new Date(event.date_time);
      const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Default 2 hours
      
      return {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate,
        resource: event,
        allDay: false,
      };
    });
  }, [events]);

  const handleSelectEvent = (calendarEvent: any) => {
    const event = calendarEvent.resource as Event;
    setSelectedEvent(event);
    setIsDialogOpen(true);
    onEventSelect?.(event);
  };

  const handleRegisterEvent = () => {
    if (selectedEvent) {
      onEventRegister?.(selectedEvent);
      setIsDialogOpen(false);
    }
  };

  const eventStyleGetter = (event: any) => {
    const eventData = event.resource as Event;
    let backgroundColor = '#10B981'; // Default dna-emerald
    
    if (eventData.is_featured) {
      backgroundColor = '#F59E0B'; // dna-gold
    } else if (eventData.is_virtual) {
      backgroundColor = '#8B5CF6'; // purple
    } else if (eventData.type === 'conference') {
      backgroundColor = '#3B82F6'; // blue
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px'
      }
    };
  };

  const convertToCalendarEvent = (event: Event): CalendarEvent => {
    const startDate = new Date(event.date_time);
    const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));
    
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate,
      endDate,
      location: event.location,
    };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-dna-emerald" />
          <h2 className="text-xl font-bold text-gray-900">Event Calendar</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={currentView === Views.MONTH ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(Views.MONTH)}
            className={currentView === Views.MONTH ? 'bg-dna-emerald hover:bg-dna-forest' : ''}
          >
            Month
          </Button>
          <Button
            variant={currentView === Views.WEEK ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(Views.WEEK)}
            className={currentView === Views.WEEK ? 'bg-dna-emerald hover:bg-dna-forest' : ''}
          >
            Week
          </Button>
          <Button
            variant={currentView === Views.AGENDA ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(Views.AGENDA)}
            className={currentView === Views.AGENDA ? 'bg-dna-emerald hover:bg-dna-forest' : ''}
          >
            Agenda
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height: '600px' }} className="p-4">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              popup
              views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
              step={60}
              showMultiDayTimes
              className="dna-calendar"
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-dna-emerald" />
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedEvent.description && (
                  <p className="text-gray-600">{selectedEvent.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-dna-emerald" />
                    <span>{format(new Date(selectedEvent.date_time), 'PPP p')}</span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2">
                      {selectedEvent.is_virtual ? (
                        <Video className="w-4 h-4 text-purple-500" />
                      ) : (
                        <MapPin className="w-4 h-4 text-dna-copper" />
                      )}
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-dna-mint" />
                    <span>{selectedEvent.attendee_count} attending</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedEvent.type && (
                    <Badge variant="outline">{selectedEvent.type}</Badge>
                  )}
                  {selectedEvent.is_virtual && (
                    <Badge className="bg-purple-100 text-purple-800">Virtual</Badge>
                  )}
                  {selectedEvent.is_featured && (
                    <Badge className="bg-dna-gold text-white">Featured</Badge>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <AddToCalendarButton 
                    event={convertToCalendarEvent(selectedEvent)}
                    variant="outline"
                    className="w-full"
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleRegisterEvent}
                      className="flex-1 bg-dna-emerald hover:bg-dna-forest"
                    >
                      Register for Event
                    </Button>
                    
                    {selectedEvent.registration_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(selectedEvent.registration_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Calendar Styles */}
      <style>{`
        .dna-calendar .rbc-calendar {
          font-family: inherit;
        }
        
        .dna-calendar .rbc-header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 8px;
          font-weight: 600;
          color: #374151;
        }
        
        .dna-calendar .rbc-today {
          background-color: #ecfdf5;
        }
        
        .dna-calendar .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .dna-calendar .rbc-event {
          border-radius: 6px;
          border: none;
          padding: 2px 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .dna-calendar .rbc-event:hover {
          opacity: 1;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }
        
        .dna-calendar .rbc-slot-selection {
          background-color: rgba(16, 185, 129, 0.1);
        }
        
        .dna-calendar .rbc-btn-group button {
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          padding: 6px 12px;
          font-weight: 500;
        }
        
        .dna-calendar .rbc-btn-group button:hover {
          background: #f3f4f6;
        }
        
        .dna-calendar .rbc-btn-group button.rbc-active {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }
      `}</style>
    </div>
  );
};

export default FullCalendarView;

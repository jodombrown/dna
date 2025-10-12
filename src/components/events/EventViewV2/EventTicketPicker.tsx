import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TicketIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { Event } from '@/types/eventTypes';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EventTicketPickerProps {
  event: Event;
}

const EventTicketPicker: React.FC<EventTicketPickerProps> = ({ event }) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  // Mock ticket types - in real implementation, these would come from the database
  const mockTicketTypes = [
    {
      id: '1',
      name: 'General Admission',
      price_cents: 0,
      payment_type: 'free',
      description: 'Standard access to the event',
      total_tickets: null,
      available: true,
    },
  ];

  const handleRegister = async () => {
    if (!selectedTicket) {
      toast.error('Please select a ticket type');
      return;
    }

    setRegistering(true);
    try {
      // TODO: Implement actual registration logic with rpc_event_register
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success('Successfully registered for the event!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for the event');
    } finally {
      setRegistering(false);
    }
  };

  const isEventFull = event.max_attendees && event.attendee_count >= event.max_attendees;
  const spotsLeft = event.max_attendees ? event.max_attendees - event.attendee_count : null;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TicketIcon className="w-5 h-5" />
          <span>Register for Event</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capacity Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
            <span>{event.attendee_count} registered</span>
          </div>
          {spotsLeft !== null && (
            <Badge variant={spotsLeft < 10 ? 'destructive' : 'secondary'}>
              {spotsLeft} spots left
            </Badge>
          )}
        </div>

        <Separator />

        {/* Ticket Types */}
        <div className="space-y-3">
          <h4 className="font-medium">Ticket Options</h4>
          {mockTicketTypes.map((ticket) => (
            <Card
              key={ticket.id}
              className={`p-3 cursor-pointer transition-all ${
                selectedTicket === ticket.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
              } ${!ticket.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => ticket.available && setSelectedTicket(ticket.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{ticket.name}</h5>
                  <div className="text-right">
                    {ticket.payment_type === 'free' ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      <span className="font-medium">
                        ${(ticket.price_cents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                
                {ticket.description && (
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{ticket.available ? 'Available' : 'Sold Out'}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    selectedTicket === ticket.id ? 'bg-primary' : 'border border-muted-foreground'
                  }`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Registration Button */}
        <div className="space-y-3">
          {isEventFull ? (
            <div className="space-y-2">
              <Button variant="default" className="w-full min-h-[44px]" disabled>
                Event Full
              </Button>
              {event.waitlist_enabled && (
                <Button variant="outline" className="w-full min-h-[44px]">
                  Join Waitlist
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              className="w-full min-h-[44px] bg-dna-emerald hover:bg-dna-forest"
              onClick={handleRegister}
              disabled={!selectedTicket || registering}
            >
              {registering ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Registering...
                </span>
              ) : (
                'Register Now'
              )}
            </Button>
          )}
          
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>Registration confirmation sent via email</span>
          </div>
        </div>

        {/* Event Stats */}
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <p className="font-medium">{event.attendee_count}</p>
            <p className="text-muted-foreground">Registered</p>
          </div>
          <div>
            <p className="font-medium">{event.type}</p>
            <p className="text-muted-foreground">Event Type</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventTicketPicker;
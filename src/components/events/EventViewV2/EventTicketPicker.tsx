import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TicketIcon, UsersIcon, ClockIcon } from 'lucide-react';
import { Event } from '@/types/eventTypes';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface EventTicketPickerProps {
  event: Event;
}

const EventTicketPicker: React.FC<EventTicketPickerProps> = ({ event }) => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  // Fetch ticket types from database
  const { data: ticketTypes = [] } = useQuery({
    queryKey: ['ticket-types', event.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('event_ticket_types')
        .select('*')
        .eq('event_id', event.id)
        .eq('hidden', false);
      return data || [];
    },
  });

  // Check if user is already registered
  const { data: existingRegistration, refetch: refetchRegistration } = useQuery({
    queryKey: ['event-registration', event.id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Auto-select first available ticket type
  useEffect(() => {
    if (ticketTypes.length > 0 && !selectedTicket) {
      setSelectedTicket(ticketTypes[0].id);
    }
  }, [ticketTypes, selectedTicket]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please sign in to register');
      return;
    }

    if (!selectedTicket) {
      toast.error('Please select a ticket type');
      return;
    }

    setRegistering(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          user_id: user.id,
          event_id: event.id,
          ticket_type_id: selectedTicket,
          status: 'going',
        });

      if (error) throw error;

      toast.success('Successfully registered for the event!');
      refetchRegistration();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for the event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!existingRegistration) return;

    setRegistering(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', existingRegistration.id);

      if (error) throw error;

      toast.success('Successfully unregistered from event');
      refetchRegistration();
    } catch (error) {
      console.error('Unregister error:', error);
      toast.error('Failed to unregister from event');
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

        {/* Already Registered Notice */}
        {existingRegistration && (
          <div className="bg-dna-emerald/10 border border-dna-emerald/20 rounded-lg p-4">
            <p className="text-sm font-medium text-dna-emerald">✓ You're registered for this event</p>
            <p className="text-xs text-muted-foreground mt-1">
              Registered on {new Date(existingRegistration.registered_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Ticket Types */}
        {!existingRegistration && ticketTypes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Ticket Options</h4>
            {ticketTypes.map((ticket) => (
              <Card
                key={ticket.id}
                className={`p-3 cursor-pointer transition-all ${
                  selectedTicket === ticket.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedTicket(ticket.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{ticket.name}</h5>
                    <div className="text-right">
                      {ticket.payment_type === 'free' ? (
                        <Badge variant="secondary">Free</Badge>
                      ) : (
                        <span className="font-medium">
                          ${((ticket.price_cents || 0) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  )}
                  
                  {ticket.require_approval && (
                    <Badge variant="outline" className="text-xs">Requires Approval</Badge>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Available</span>
                    <div className={`w-3 h-3 rounded-full ${
                      selectedTicket === ticket.id ? 'bg-primary' : 'border border-muted-foreground'
                    }`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Separator />

        {/* Registration Buttons */}
        <div className="space-y-3">
          {existingRegistration ? (
            <Button
              variant="outline"
              className="w-full min-h-[44px] text-destructive hover:text-destructive"
              onClick={handleUnregister}
              disabled={registering}
            >
              {registering ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Unregistering...
                </span>
              ) : (
                'Unregister from Event'
              )}
            </Button>
          ) : isEventFull ? (
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
              disabled={!selectedTicket || registering || !user}
            >
              {registering ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Registering...
                </span>
              ) : !user ? (
                'Sign in to Register'
              ) : (
                'Register Now'
              )}
            </Button>
          )}
          
          {!existingRegistration && (
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <ClockIcon className="w-3 h-3 mr-1" />
              <span>Registration confirmation sent via email</span>
            </div>
          )}
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
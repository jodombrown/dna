import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Event } from '@/types/eventTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  payment_type: 'free' | 'paid' | 'flex';
  total_tickets?: number;
  sold_tickets: number;
  require_approval: boolean;
}

interface TicketTypePickerProps {
  event: Event;
  onTicketSelect?: (ticketTypeId: string) => void;
}

const TicketTypePicker: React.FC<TicketTypePickerProps> = ({ event, onTicketSelect }) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadTicketTypes();
  }, [event.id]);

  const loadTicketTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_ticket_types')
        .select('*')
        .eq('event_id', event.id)
        .eq('hidden', false);

      if (error) throw error;

      const normalized = (data || []).map(ticket => ({
        ...ticket,
        payment_type: ticket.payment_type as 'free' | 'paid' | 'flex',
        sold_tickets: 0,
      }));

      setTicketTypes(normalized);
      if (normalized.length > 0) {
        setSelectedTicket(normalized[0].id);
      }
    } catch (error) {
      console.error('Error loading ticket types:', error);
      toast.error('Failed to load ticket information');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedTicket) {
      toast.error('Please select a ticket type');
      return;
    }

    setRegistering(true);
    try {
      const { error } = await supabase.rpc('rpc_event_register', {
        p_event: event.id
      });

      if (error) {
        if (error.message.includes('capacity_reached')) {
          toast.error('Event is at capacity. Join the waitlist instead!');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Successfully registered for the event!');
      onTicketSelect?.(selectedTicket);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinWaitlist = async () => {
    try {
      const position = await supabase.rpc('rpc_event_join_waitlist', {
        p_event: event.id
      });

      toast.success(`Joined waitlist at position ${position}`);
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error('Failed to join waitlist');
    }
  };

  const formatPrice = (priceCents: number, paymentType: string) => {
    if (paymentType === 'free') return 'Free';
    if (paymentType === 'flex') return 'Pay what you can';
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const isEventFull = event.max_attendees && event.attendee_count >= event.max_attendees;
  const hasWaitlist = event.waitlist_enabled;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading tickets...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No tickets available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ticket information is not yet available for this event.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Ticket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedTicket} onValueChange={setSelectedTicket}>
          {ticketTypes.map((ticket) => {
            const isSoldOut = false;
            
            return (
              <div key={ticket.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={ticket.id} 
                    id={ticket.id}
                    disabled={isEventFull}
                  />
                  <Label 
                    htmlFor={ticket.id} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {ticket.name}
                          {ticket.require_approval && (
                            <Badge variant="outline" className="text-xs">
                              Approval Required
                            </Badge>
                          )}
                          {isSoldOut && (
                            <Badge variant="destructive" className="text-xs">
                              Sold Out
                            </Badge>
                          )}
                        </div>
                        {ticket.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {ticket.description}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold">
                        {formatPrice(ticket.price_cents, ticket.payment_type)}
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        <div className="pt-4 space-y-2">
          {isEventFull ? (
            <>
              <Badge variant="destructive" className="w-full justify-center py-2">
                Event Full
              </Badge>
              {hasWaitlist && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleJoinWaitlist}
                >
                  Join Waitlist
                </Button>
              )}
            </>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleRegister}
              disabled={!selectedTicket || registering}
            >
              {registering ? 'Registering...' : 'Register Now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketTypePicker;
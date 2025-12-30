import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2Icon, PlusIcon, DollarSignIcon, UsersIcon, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventData } from './index';

interface StepTicketsProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
  eventId?: string | null;
  onNext?: () => void;
  onBack?: () => void;
}

interface TicketType {
  id?: string;
  name: string;
  description?: string;
  price_cents: number;
  payment_type: 'free' | 'paid' | 'flex';
  total_tickets?: number;
  require_approval: boolean;
}

type TicketFormData = {
  name: string;
  description: string;
  payment_type: 'free' | 'paid' | 'flex';
  price: number;
  total_tickets: string;
  require_approval: boolean;
};

const StepTickets: React.FC<StepTicketsProps> = ({ 
  eventData, 
  updateEventData, 
  eventId, 
  onNext, 
  onBack 
}) => {
  const [tickets, setTickets] = useState<TicketType[]>(eventData.ticket_types || []);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<TicketFormData>({
    defaultValues: {
      name: '',
      description: '',
      payment_type: 'free',
      price: 0,
      total_tickets: '',
      require_approval: false
    }
  });

  const paymentType = watch('payment_type');

  useEffect(() => {
    if (eventId) {
      loadExistingTickets();
    }
  }, [eventId]);

  const loadExistingTickets = async () => {
    if (!eventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_ticket_types')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;

      const formattedTickets = (data || []).map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        description: ticket.description || '',
        price_cents: ticket.price_cents || 0,
        payment_type: ticket.payment_type as 'free' | 'paid' | 'flex',
        total_tickets: ticket.total_tickets || undefined,
        require_approval: ticket.require_approval || false
      }));

      setTickets(formattedTickets);
      updateEventData('ticket_types', formattedTickets);
    } catch (error) {
      toast.error('Failed to load existing tickets');
    }
  };

  const addTicket = async (formData: TicketFormData) => {
    setLoading(true);
    try {
      const newTicket: TicketType = {
        name: formData.name,
        description: formData.description,
        price_cents: formData.payment_type === 'paid' ? Math.round(formData.price * 100) : 0,
        payment_type: formData.payment_type,
        total_tickets: formData.total_tickets ? parseInt(formData.total_tickets) : undefined,
        require_approval: formData.require_approval
      };

      if (eventId) {
        // Save to database
        const { data, error } = await supabase
          .from('event_ticket_types')
          .insert({
            event_id: eventId,
            name: newTicket.name,
            description: newTicket.description,
            price_cents: newTicket.price_cents,
            payment_type: newTicket.payment_type,
            total_tickets: newTicket.total_tickets,
            require_approval: newTicket.require_approval
          })
          .select('id')
          .maybeSingle();

        if (error) throw error;
        if (data) newTicket.id = data.id;
      }

      const updatedTickets = [...tickets, newTicket];
      setTickets(updatedTickets);
      updateEventData('ticket_types', updatedTickets);
      
      toast.success('Ticket type added successfully!');
      reset();
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to add ticket type');
    } finally {
      setLoading(false);
    }
  };

  const removeTicket = async (index: number) => {
    const ticket = tickets[index];
    
    if (ticket.id && eventId) {
      try {
        const { error } = await supabase
          .from('event_ticket_types')
          .delete()
          .eq('id', ticket.id);

        if (error) throw error;
      } catch (error) {
        toast.error('Failed to remove ticket type');
        return;
      }
    }

    const updatedTickets = tickets.filter((_, i) => i !== index);
    setTickets(updatedTickets);
    updateEventData('ticket_types', updatedTickets);
    toast.success('Ticket type removed');
  };

  const formatPrice = (priceCents: number, paymentType: string) => {
    if (paymentType === 'free') return 'Free';
    if (paymentType === 'flex') return 'Pay what you can';
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const handlePayment = async (ticketId: string) => {
    try {
      setProcessingPayment(ticketId);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          ticketTypeId: ticketId,
          eventId: eventId
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleContinue = () => {
    if (tickets.length === 0) {
      toast.error('Please add at least one ticket type');
      return;
    }
    onNext?.();
  };

  return (
    <div className="space-y-6">
      {/* Event Capacity Settings */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="capacity">Event Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={eventData.capacity || ''}
            onChange={(e) => updateEventData('capacity', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Leave empty for unlimited capacity"
            className="mt-1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="waitlist_enabled"
            checked={eventData.waitlist_enabled}
            onCheckedChange={(checked) => updateEventData('waitlist_enabled', checked)}
          />
          <Label htmlFor="waitlist_enabled">Enable waitlist when full</Label>
        </div>
      </div>

      {/* Ticket Types Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Ticket Types</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Ticket Type
          </Button>
        </div>

        {/* Existing Tickets */}
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <Card key={ticket.id || index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{ticket.name}</h4>
                      <Badge variant={ticket.payment_type === 'free' ? 'secondary' : 'default'}>
                        {formatPrice(ticket.price_cents, ticket.payment_type)}
                      </Badge>
                      {ticket.require_approval && (
                        <Badge variant="outline">Requires Approval</Badge>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    )}
                    {ticket.total_tickets && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Limited to {ticket.total_tickets} tickets
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.payment_type === 'paid' && ticket.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePayment(ticket.id!)}
                        disabled={processingPayment === ticket.id}
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        {processingPayment === ticket.id ? "Processing..." : "Test Purchase"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTicket(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tickets.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <UsersIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No ticket types added yet</p>
                <p className="text-sm text-muted-foreground">Add your first ticket type to get started</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Ticket Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Ticket Type</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(addTicket)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ticket Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Ticket name is required' })}
                      placeholder="e.g., General Admission, VIP, Student"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="payment_type">Payment Type</Label>
                    <Select 
                      value={paymentType} 
                      onValueChange={(value) => {
                        const event = { target: { value } };
                        register('payment_type').onChange(event);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Fixed Price</SelectItem>
                        <SelectItem value="flex">Pay What You Can</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentType === 'paid' && (
                  <div>
                    <Label htmlFor="price">Price (USD) *</Label>
                    <div className="relative">
                      <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('price', { 
                          required: paymentType === 'paid' ? 'Price is required for paid tickets' : false,
                          min: { value: 0, message: 'Price must be positive' }
                        })}
                        placeholder="0.00"
                        className="pl-10"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="What's included with this ticket?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_tickets">Available Quantity</Label>
                    <Input
                      id="total_tickets"
                      type="number"
                      min="1"
                      {...register('total_tickets')}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="require_approval"
                      {...register('require_approval')}
                    />
                    <Label htmlFor="require_approval" className="text-sm">
                      Require manual approval
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Ticket Type'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Ticket & Payment Processing</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Free tickets are great for community events and workshops</li>
          <li>• Use "Pay What You Can" for inclusive pricing with suggested donations</li>
          <li>• For paid tickets, payment processing requires Stripe integration</li>
          <li>• Set quantity limits to create urgency and manage capacity</li>
        </ul>
      </div>

      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button onClick={handleContinue} disabled={loading}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepTickets;

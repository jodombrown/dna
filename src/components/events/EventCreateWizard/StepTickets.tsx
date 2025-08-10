import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, TrashIcon, TicketIcon } from 'lucide-react';
import { EventData } from './index';

interface StepTicketsProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
}

const StepTickets: React.FC<StepTicketsProps> = ({ eventData, updateEventData }) => {
  const addTicketType = () => {
    const newTicketType = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price_cents: 0,
      payment_type: 'free',
      description: '',
      total_tickets: null,
      require_approval: false,
    };
    updateEventData('ticket_types', [...eventData.ticket_types, newTicketType]);
  };

  const updateTicketType = (index: number, field: string, value: any) => {
    const updated = [...eventData.ticket_types];
    updated[index] = { ...updated[index], [field]: value };
    updateEventData('ticket_types', updated);
  };

  const removeTicketType = (index: number) => {
    if (eventData.ticket_types.length > 1) {
      const updated = eventData.ticket_types.filter((_, i) => i !== index);
      updateEventData('ticket_types', updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Maximum Attendees</Label>
          <Input
            id="capacity"
            type="number"
            value={eventData.capacity || ''}
            onChange={(e) => updateEventData('capacity', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Leave empty for unlimited"
            className="mt-1"
          />
        </div>
        
        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="waitlist_enabled"
            checked={eventData.waitlist_enabled}
            onCheckedChange={(checked) => updateEventData('waitlist_enabled', checked)}
          />
          <Label htmlFor="waitlist_enabled">Enable waitlist when full</Label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TicketIcon className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Ticket Types</h3>
          </div>
          <Button onClick={addTicketType} size="sm" variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Ticket Type
          </Button>
        </div>

        <div className="space-y-4">
          {eventData.ticket_types.map((ticket, index) => (
            <Card key={ticket.id || index} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ticket Type {index + 1}</h4>
                  {eventData.ticket_types.length > 1 && (
                    <Button
                      onClick={() => removeTicketType(index)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ticket Name</Label>
                    <Input
                      value={ticket.name}
                      onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                      placeholder="e.g., General Admission, VIP, Student"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Payment Type</Label>
                    <Select
                      value={ticket.payment_type}
                      onValueChange={(value) => updateTicketType(index, 'payment_type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="donation">Pay What You Can</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {ticket.payment_type === 'paid' && (
                  <div>
                    <Label>Price (in cents)</Label>
                    <Input
                      type="number"
                      value={ticket.price_cents}
                      onChange={(e) => updateTicketType(index, 'price_cents', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 2500 for $25.00"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={ticket.description || ''}
                    onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                    placeholder="What's included with this ticket?"
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Available Tickets</Label>
                    <Input
                      type="number"
                      value={ticket.total_tickets || ''}
                      onChange={(e) => updateTicketType(index, 'total_tickets', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Leave empty for unlimited"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      checked={ticket.require_approval || false}
                      onCheckedChange={(checked) => updateTicketType(index, 'require_approval', checked)}
                    />
                    <Label>Require approval</Label>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepTickets;
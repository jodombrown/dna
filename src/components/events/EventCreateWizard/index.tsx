import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPinIcon, TicketIcon, UsersIcon, PaletteIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StepBasics from './StepBasics';
import StepLocation from './StepLocation';
import StepTickets from './StepTickets';
import StepRegistration from './StepRegistration';
import StepDesignVisibility from './StepDesignVisibility';

const WIZARD_STEPS = [
  { id: 'basics', title: 'Basics', icon: CalendarIcon },
  { id: 'location', title: 'Location/Online', icon: MapPinIcon },
  { id: 'tickets', title: 'Tickets', icon: TicketIcon },
  { id: 'registration', title: 'Registration', icon: UsersIcon },
  { id: 'design', title: 'Design & Visibility', icon: PaletteIcon },
];

export interface EventData {
  title: string;
  description: string;
  date_time: string;
  location: string;
  type: string;
  is_virtual: boolean;
  visibility: string;
  capacity: number | null;
  waitlist_enabled: boolean;
  online_url: string;
  slug: string;
  image_url: string;
  banner_url: string;
  theme: string;
  registration_questions: any[];
  ticket_types: any[];
}

interface EventCreateWizardProps {
  onNext?: (eventId: string) => void;
}

const EventCreateWizard: React.FC<EventCreateWizardProps> = ({ onNext }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    date_time: '',
    location: '',
    type: 'workshop',
    is_virtual: false,
    visibility: 'public',
    capacity: null,
    waitlist_enabled: false,
    online_url: '',
    slug: '',
    image_url: '',
    banner_url: '',
    theme: 'default',
    registration_questions: [],
    ticket_types: [{ name: 'General Admission', price_cents: 0, payment_type: 'free' }],
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Math.random().toString(36).substr(2, 6);
  };

  const updateEventData = (field: keyof EventData, value: any) => {
    setEventData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && value) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Save draft after StepBasics
  const saveDraft = async () => {
    if (!eventData.title.trim()) {
      toast.error('Event title is required');
      return false;
    }

    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('You must be logged in to create events');
        return false;
      }

      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        date_time: eventData.date_time || new Date().toISOString(),
        location: eventData.location,
        type: eventData.type,
        is_virtual: eventData.is_virtual,
        visibility: 'draft',
        capacity: eventData.capacity,
        waitlist_enabled: eventData.waitlist_enabled,
        online_url: eventData.online_url,
        slug: eventData.slug,
        image_url: eventData.image_url,
        banner_url: eventData.banner_url,
        theme: eventData.theme,
        created_by: user.user.id,
        max_attendees: eventData.capacity,
      };

      if (eventId) {
        // Update existing draft
        const { error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', eventId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data: event, error } = await supabase
          .from('events')
          .insert([eventPayload])
          .select('id')
          .single();

        if (error) throw error;
        setEventId(event.id);
        onNext?.(event.id);
      }

      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    // Save draft after completing StepBasics
    if (currentStep === 0) {
      const saved = await saveDraft();
      if (!saved) return;
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finalizeEvent = async () => {
    if (!eventId) {
      toast.error('No draft event found');
      return;
    }

    setSaving(true);
    try {
      // Update event to published status
      const { error } = await supabase
        .from('events')
        .update({ 
          visibility: eventData.visibility,
          ...eventData 
        })
        .eq('id', eventId);

      if (error) throw error;

      // Create ticket types
      if (eventData.ticket_types.length > 0) {
        const ticketTypes = eventData.ticket_types.map(ticket => ({
          event_id: eventId,
          name: ticket.name,
          price_cents: ticket.price_cents || 0,
          payment_type: ticket.payment_type || 'free',
          description: ticket.description,
          total_tickets: ticket.total_tickets,
          require_approval: ticket.require_approval || false,
        }));

        const { error: ticketError } = await supabase
          .from('event_ticket_types')
          .insert(ticketTypes);

        if (ticketError) throw ticketError;
      }

      // Create registration questions
      if (eventData.registration_questions.length > 0) {
        const questions = eventData.registration_questions.map((q, index) => ({
          event_id: eventId,
          label: q.question,
          type: q.type,
          required: q.required || false,
          options: q.options || null,
          position: index,
        }));

        const { error: questionError } = await supabase
          .from('event_registration_questions')
          .insert(questions);

        if (questionError) throw questionError;
      }

      toast.success('Event created successfully!');
      // Phase 1.5: Navigate to events list instead of slug-based detail page
      navigate('/dna/events');
    } catch (error) {
      console.error('Error finalizing event:', error);
      toast.error('Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];

    switch (step.id) {
      case 'basics':
        return <StepBasics eventData={eventData} updateEventData={updateEventData} />;
      case 'location':
        return <StepLocation eventData={eventData} updateEventData={updateEventData} />;
      case 'tickets':
        return <StepTickets eventData={eventData} updateEventData={updateEventData} eventId={eventId} />;
      case 'registration':
        return <StepRegistration eventData={eventData} updateEventData={updateEventData} eventId={eventId} />;
      case 'design':
        return <StepDesignVisibility eventData={eventData} updateEventData={updateEventData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <div className="flex items-center space-x-4 mt-4 overflow-x-auto">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 whitespace-nowrap ${
                    index === currentStep ? 'text-primary' : index < currentStep ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                  {index < WIZARD_STEPS.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/dna/events')}
              >
                Cancel
              </Button>
              
              {currentStep === WIZARD_STEPS.length - 1 ? (
                <Button onClick={finalizeEvent} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Event'}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={saving}>
                  {saving ? 'Saving...' : 'Next'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCreateWizard;
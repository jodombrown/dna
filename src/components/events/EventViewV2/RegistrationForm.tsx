import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Event } from '@/types/eventTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RegistrationQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  position: number;
}

interface RegistrationFormProps {
  event: Event;
  ticketTypeId?: string;
  onRegistrationComplete?: (status: 'registered' | 'pending' | 'waitlist') => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  event, 
  ticketTypeId,
  onRegistrationComplete 
}) => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRegistrationQuestions();
  }, [event.id]);

  const loadRegistrationQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registration_questions')
        .select('*')
        .eq('event_id', event.id)
        .order('position');

      if (error) throw error;

      setQuestions((data || []).map(q => ({
        id: q.id,
        label: q.label,
        type: q.type as 'text' | 'textarea' | 'select' | 'radio' | 'checkbox',
        required: q.required || false,
        position: q.position || 0,
        options: Array.isArray(q.options) 
          ? q.options.map(opt => String(opt))
          : q.options 
            ? [String(q.options)]
            : []
      })));
    } catch (error) {
      console.error('Error loading registration questions:', error);
      toast.error('Failed to load registration form');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateForm = () => {
    for (const question of questions) {
      if (question.required && (!answers[question.id] || answers[question.id] === '')) {
        toast.error(`${question.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('You must be logged in to register');
        return;
      }

      // Register for the event
      const { error: regError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: user.user.id,
          ticket_type_id: ticketTypeId,
          answers: answers,
          status: 'registered'
        });

      if (regError) {
        if (regError.message.includes('capacity_reached')) {
          // Try joining waitlist
          const position = await supabase.rpc('rpc_event_join_waitlist', {
            p_event: event.id
          });
          toast.success(`Event is full. You've been added to the waitlist at position ${position}`);
          onRegistrationComplete?.('waitlist');
        } else {
          throw regError;
        }
        return;
      }

      toast.success('Successfully registered for the event!');
      onRegistrationComplete?.('registered');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register for event');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: RegistrationQuestion) => {
    const questionId = question.id;

    switch (question.type) {
      case 'text':
        return (
          <Input
            id={questionId}
            value={answers[questionId] || ''}
            onChange={(e) => updateAnswer(questionId, e.target.value)}
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={questionId}
            value={answers[questionId] || ''}
            onChange={(e) => updateAnswer(questionId, e.target.value)}
            required={question.required}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select 
            value={answers[questionId] || ''} 
            onValueChange={(value) => updateAnswer(questionId, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup 
            value={answers[questionId] || ''} 
            onValueChange={(value) => updateAnswer(questionId, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${questionId}-${index}`} />
                <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const currentValues = answers[questionId] || [];
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionId}-${index}`}
                  checked={currentValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateAnswer(questionId, [...currentValues, option]);
                    } else {
                      updateAnswer(questionId, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading registration form...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (questions.length === 0) {
    return null; // No additional questions
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id}>
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderQuestion(question)}
            </div>
          ))}
          
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
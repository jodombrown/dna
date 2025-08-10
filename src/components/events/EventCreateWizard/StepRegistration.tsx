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
import { Trash2Icon, PlusIcon, HelpCircleIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventData } from './index';

interface StepRegistrationProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
  eventId?: string | null;
  onNext?: () => void;
  onBack?: () => void;
}

interface RegistrationQuestion {
  id?: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  position: number;
}

type QuestionFormData = {
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options: string;
};

const StepRegistration: React.FC<StepRegistrationProps> = ({ 
  eventData, 
  updateEventData, 
  eventId, 
  onNext, 
  onBack 
}) => {
  const [questions, setQuestions] = useState<RegistrationQuestion[]>(eventData.registration_questions || []);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<QuestionFormData>({
    defaultValues: {
      label: '',
      type: 'text',
      required: false,
      options: ''
    }
  });

  const questionType = watch('type');

  useEffect(() => {
    if (eventId) {
      loadExistingQuestions();
    }
  }, [eventId]);

  const loadExistingQuestions = async () => {
    if (!eventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_registration_questions')
        .select('*')
        .eq('event_id', eventId)
        .order('position');

      if (error) throw error;

      const formattedQuestions = (data || []).map(q => ({
        id: q.id,
        label: q.label,
        type: mapDbTypeToComponentType(q.type),
        required: q.required || false,
        position: q.position || 0,
        options: Array.isArray(q.options) 
          ? q.options.map(opt => String(opt))
          : q.options 
            ? [String(q.options)]
            : []
      }));

      setQuestions(formattedQuestions);
      updateEventData('registration_questions', formattedQuestions);
    } catch (error) {
      console.error('Error loading registration questions:', error);
      toast.error('Failed to load existing questions');
    }
  };

  const mapDbTypeToComponentType = (dbType: string): 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' => {
    switch (dbType) {
      case 'text_short':
      case 'company':
      case 'social':
      case 'website':
        return 'text';
      case 'text_long':
        return 'textarea';
      case 'options':
        return 'select';
      case 'terms':
      case 'checkbox':
        return 'checkbox';
      default:
        return 'text';
    }
  };

  const mapComponentTypeToDbType = (componentType: string): string => {
    switch (componentType) {
      case 'text':
        return 'text_short';
      case 'textarea':
        return 'text_long';
      case 'select':
        return 'options';
      case 'radio':
        return 'options';
      case 'checkbox':
        return 'checkbox';
      default:
        return 'text_short';
    }
  };

  const addQuestion = async (formData: QuestionFormData) => {
    setLoading(true);
    try {
      const newQuestion: RegistrationQuestion = {
        label: formData.label,
        type: formData.type,
        required: formData.required,
        position: questions.length,
        options: formData.options ? formData.options.split('\n').filter(opt => opt.trim()) : []
      };

      if (eventId) {
        // Save to database
        const { data, error } = await supabase
          .from('event_registration_questions')
          .insert({
            event_id: eventId,
            label: newQuestion.label,
            type: mapComponentTypeToDbType(newQuestion.type),
            required: newQuestion.required,
            position: newQuestion.position,
            options: newQuestion.options && newQuestion.options.length > 0 ? newQuestion.options : null
          })
          .select('id')
          .maybeSingle();

        if (error) throw error;
        if (data) newQuestion.id = data.id;
      }

      const updatedQuestions = [...questions, newQuestion];
      setQuestions(updatedQuestions);
      updateEventData('registration_questions', updatedQuestions);
      
      toast.success('Question added successfully!');
      reset();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = async (index: number) => {
    const question = questions[index];
    
    if (question.id && eventId) {
      try {
        const { error } = await supabase
          .from('event_registration_questions')
          .delete()
          .eq('id', question.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error removing question:', error);
        toast.error('Failed to remove question');
        return;
      }
    }

    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    updateEventData('registration_questions', updatedQuestions);
    toast.success('Question removed');
  };

  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case 'text': return 'Short Text';
      case 'textarea': return 'Long Text';
      case 'select': return 'Dropdown';
      case 'radio': return 'Multiple Choice';
      case 'checkbox': return 'Checkboxes';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Registration Questions</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Question
          </Button>
        </div>

        {/* Existing Questions */}
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Card key={question.id || index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{question.label}</h4>
                      <Badge variant="outline">
                        {getQuestionTypeDisplay(question.type)}
                      </Badge>
                      {question.required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                    </div>
                    {question.options && question.options.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Options: {question.options.join(', ')}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <HelpCircleIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No custom questions added yet</p>
                <p className="text-sm text-muted-foreground">Add questions to collect additional information from attendees</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Registration Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(addQuestion)} className="space-y-4">
                <div>
                  <Label htmlFor="label">Question *</Label>
                  <Input
                    id="label"
                    {...register('label', { required: 'Question text is required' })}
                    placeholder="e.g., What's your dietary preference?"
                  />
                  {errors.label && (
                    <p className="text-sm text-destructive mt-1">{errors.label.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Answer Type</Label>
                  <Select 
                    value={questionType} 
                    onValueChange={(value) => {
                      const event = { target: { value } };
                      register('type').onChange(event);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="select">Dropdown</SelectItem>
                      <SelectItem value="radio">Multiple Choice</SelectItem>
                      <SelectItem value="checkbox">Checkboxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(questionType === 'select' || questionType === 'radio' || questionType === 'checkbox') && (
                  <div>
                    <Label htmlFor="options">Options (one per line) *</Label>
                    <Textarea
                      id="options"
                      {...register('options', { 
                        required: 'Options are required for this question type' 
                      })}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={4}
                    />
                    {errors.options && (
                      <p className="text-sm text-destructive mt-1">{errors.options.message}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    {...register('required')}
                  />
                  <Label htmlFor="required" className="text-sm">
                    Required field
                  </Label>
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
                    {loading ? 'Adding...' : 'Add Question'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Registration Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Keep questions simple and relevant to your event</li>
          <li>• Use required fields sparingly to reduce friction</li>
          <li>• Collect dietary preferences, accessibility needs, or skill levels</li>
          <li>• Short text works for names, companies, or brief responses</li>
          <li>• Use dropdown/multiple choice for standardized answers</li>
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
        <Button onClick={onNext} disabled={loading}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepRegistration;

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, TrashIcon, HelpCircleIcon } from 'lucide-react';
import { EventData } from './index';

interface StepRegistrationProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
  eventId?: string | null;
}

const StepRegistration: React.FC<StepRegistrationProps> = ({ eventData, updateEventData }) => {
  const addRegistrationQuestion = () => {
    const newQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      type: 'text',
      required: false,
      options: [],
      position: eventData.registration_questions.length,
    };
    updateEventData('registration_questions', [...eventData.registration_questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...eventData.registration_questions];
    updated[index] = { ...updated[index], [field]: value };
    updateEventData('registration_questions', updated);
  };

  const removeQuestion = (index: number) => {
    const updated = eventData.registration_questions.filter((_, i) => i !== index);
    updateEventData('registration_questions', updated);
  };

  const updateQuestionOptions = (questionIndex: number, options: string) => {
    const optionsArray = options.split('\n').filter(opt => opt.trim());
    updateQuestion(questionIndex, 'options', optionsArray);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircleIcon className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Registration Questions</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Collect additional information from attendees during registration. Name and email are automatically collected.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="font-medium">Custom Questions</h4>
        <Button onClick={addRegistrationQuestion} size="sm" variant="outline">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {eventData.registration_questions.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="text-muted-foreground">
            <HelpCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No custom questions added yet</p>
            <p className="text-sm">Click "Add Question" to collect additional information from attendees</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {eventData.registration_questions.map((question, index) => (
            <Card key={question.id || index} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Question {index + 1}</h5>
                  <Button
                    onClick={() => removeQuestion(index)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Question Text</Label>
                    <Input
                      value={question.label}
                      onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                      placeholder="Enter your question"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) => updateQuestion(index, 'type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="textarea">Long Text</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="radio">Multiple Choice</SelectItem>
                        <SelectItem value="checkbox">Checkboxes</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {['select', 'radio', 'checkbox'].includes(question.type) && (
                  <div>
                    <Label>Options (one per line)</Label>
                    <Textarea
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => updateQuestionOptions(index, e.target.value)}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={question.required || false}
                    onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                  />
                  <Label>Required question</Label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Registration Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep questions relevant and essential</li>
          <li>• Consider dietary restrictions, accessibility needs</li>
          <li>• Ask about t-shirt sizes for swag distribution</li>
          <li>• Professional info: company, role, LinkedIn</li>
        </ul>
      </div>
    </div>
  );
};

export default StepRegistration;
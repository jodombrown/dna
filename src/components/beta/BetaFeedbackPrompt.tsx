import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Bug, Lightbulb, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBetaFeedback } from '@/hooks/useBetaFeedback';

interface BetaFeedbackPromptProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  promptType: 'prompt_response' | 'bug_report' | 'suggestion' | 'completion';
  customPrompt?: string;
}

const BetaFeedbackPrompt: React.FC<BetaFeedbackPromptProps> = ({
  isOpen,
  onClose,
  featureName,
  promptType,
  customPrompt
}) => {
  const [rating, setRating] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { submitFeedback } = useBetaFeedback();

  const getIcon = () => {
    switch (promptType) {
      case 'bug_report': return <Bug className="w-5 h-5 text-red-500" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'completion': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <MessageSquare className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTitle = () => {
    switch (promptType) {
      case 'bug_report': return 'Report an Issue';
      case 'suggestion': return 'Share Your Ideas';
      case 'completion': return 'Feature Completed!';
      default: return 'Share Your Feedback';
    }
  };

  const getPromptText = () => {
    if (customPrompt) return customPrompt;
    
    switch (promptType) {
      case 'bug_report':
        return `Did you encounter any issues while using ${featureName}? Please describe what happened.`;
      case 'suggestion':
        return `How could we improve ${featureName}? What features would you like to see?`;
      case 'completion':
        return `Great job testing ${featureName}! How was your experience?`;
      default:
        return `What do you think of ${featureName}? Your feedback helps us improve!`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || !feedback.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a rating and feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        featureName,
        feedbackType: promptType,
        rating: parseInt(rating),
        feedbackText: feedback,
        metadata: { prompt: getPromptText() }
      });

      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });

      setRating('');
      setFeedback('');
      onClose();
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">{getPromptText()}</p>
          </div>

          <div className="space-y-3">
            <Label>Rate your experience (1-5)</Label>
            <RadioGroup value={rating} onValueChange={setRating} className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-center space-x-1">
                  <RadioGroupItem value={num.toString()} id={`rating-${num}`} />
                  <Label htmlFor={`rating-${num}`} className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {num}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Your detailed feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Skip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BetaFeedbackPrompt;
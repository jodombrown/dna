import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bug, Lightbulb, MessageCircle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const [type, setType] = useState<'bug' | 'feature' | 'general' | 'story'>('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, description: 'Report a technical issue' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, description: 'Suggest new functionality' },
    { value: 'general', label: 'General Feedback', icon: MessageCircle, description: 'Share your thoughts' },
    { value: 'story', label: 'Success Story', icon: Star, description: 'Tell us about your impact' }
  ];

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          type,
          message: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });

      setMessage('');
      setType('general');
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>What type of feedback are you sharing?</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as typeof type)}>
              {feedbackTypes.map(({ value, label, icon: Icon, description }) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={value} />
                  <Label 
                    htmlFor={value} 
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your feedback *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'bug' ? "Please describe the issue you encountered..."
                : type === 'feature' ? "What feature would you like to see added?"
                : type === 'story' ? "Tell us about the positive impact you've experienced..."
                : "Share your thoughts about DNA..."
              }
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !message.trim()}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Heart, ThumbsUp, Smile, Meh, Frown } from 'lucide-react';

interface FeedbackWidgetProps {
  onComplete: () => void;
  onSkip: () => void;
}

const EMOJI_OPTIONS = [
  { emoji: '😍', value: 'love', icon: Heart, label: 'Love it!' },
  { emoji: '😊', value: 'happy', icon: Smile, label: 'Great!' },
  { emoji: '👍', value: 'good', icon: ThumbsUp, label: 'Good' },
  { emoji: '😐', value: 'okay', icon: Meh, label: 'Okay' },
  { emoji: '😕', value: 'poor', icon: Frown, label: 'Could be better' },
];

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ onComplete, onSkip }) => {
  const [feedbackType, setFeedbackType] = useState<'emoji' | 'rating'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit feedback",
          variant: "destructive"
        });
        return;
      }

      const feedbackData = {
        user_id: user.id,
        emoji_feedback: feedbackType === 'emoji' ? selectedEmoji : null,
        rating: feedbackType === 'rating' ? rating : null,
        feedback_text: feedbackText || null,
      };

      const { error } = await supabase
        .from('onboarding_feedback')
        .insert(feedbackData);

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve the onboarding experience",
      });

      onComplete();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = feedbackType === 'emoji' ? selectedEmoji : rating > 0;

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">How was your onboarding experience?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your feedback helps us create better experiences for the DNA community
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feedback Type Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={feedbackType === 'emoji' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFeedbackType('emoji')}
            className="flex-1"
          >
            😊 Quick
          </Button>
          <Button
            variant={feedbackType === 'rating' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFeedbackType('rating')}
            className="flex-1"
          >
            ⭐ Detailed
          </Button>
        </div>

        {/* Emoji Feedback */}
        {feedbackType === 'emoji' && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={selectedEmoji === option.value ? 'default' : 'outline'}
                    className="h-16 flex-col gap-1 text-xs"
                    onClick={() => setSelectedEmoji(option.value)}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="hidden sm:block">{option.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Star Rating */}
        {feedbackType === 'rating' && (
          <div className="space-y-4">
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating 
                        ? 'fill-primary text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>
        )}

        {/* Optional Text Feedback */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Anything specific you'd like to share? (Optional)
          </label>
          <Textarea
            placeholder="Your feedback helps us improve..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="min-h-20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
            disabled={isSubmitting}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
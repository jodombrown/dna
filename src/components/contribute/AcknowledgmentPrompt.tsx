import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

interface AcknowledgmentPromptProps {
  fulfillmentId: string;
  toProfile: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export function AcknowledgmentPrompt({ fulfillmentId, toProfile }: AcknowledgmentPromptProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Check if user already wrote an acknowledgment
  const { data: existingAcks } = useQuery({
    queryKey: ['fulfillment-acks', fulfillmentId, user?.id],
    queryFn: async () => {
      const { data } = await (await import('@/integrations/supabase/client')).supabase
        .from('contribution_acknowledgments')
        .select('id')
        .eq('fulfillment_id', fulfillmentId)
        .eq('from_profile_id', user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: () =>
      contributeApplicationService.createAcknowledgment(
        fulfillmentId,
        toProfile.id,
        message,
        rating || undefined,
        isPublic
      ),
    onSuccess: () => {
      toast.success('Acknowledgment sent!');
      queryClient.invalidateQueries({ queryKey: ['fulfillment-acks', fulfillmentId] });
    },
    onError: () => toast.error('Failed to send acknowledgment'),
  });

  // Don't show if already acknowledged or dismissed
  if (dismissed || (existingAcks && existingAcks.length > 0)) return null;

  return (
    <Card className="border-[#B87333]/30">
      <CardHeader>
        <CardTitle className="text-base">Acknowledge {toProfile.name}'s contribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Rating (optional)</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star === rating ? 0 : star)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= rating ? 'fill-[#B87333] text-[#B87333]' : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <Textarea
          placeholder="Write a public message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        {/* Public Toggle */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-border"
          />
          Make this public on {toProfile.name}'s profile
        </label>

        <div className="flex gap-2">
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || message.length < 20}
            className="flex-1 bg-[#B87333] hover:bg-[#a5632c]"
          >
            <Send className="h-4 w-4 mr-2" />
            {mutation.isPending ? 'Sending...' : 'Send Acknowledgment'}
          </Button>
          <Button variant="ghost" onClick={() => setDismissed(true)} className="text-muted-foreground">
            Skip for now
          </Button>
        </div>
        {message.length > 0 && message.length < 20 && (
          <p className="text-xs text-muted-foreground">Minimum 20 characters ({message.length}/20)</p>
        )}
      </CardContent>
    </Card>
  );
}

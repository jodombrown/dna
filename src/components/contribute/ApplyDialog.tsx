import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ApplyDialogProps {
  opportunity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplyDialog: React.FC<ApplyDialogProps> = ({ opportunity, open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = React.useState('');

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('opportunity_applications').insert({
        opportunity_id: opportunity.id,
        applicant_id: user?.id,
        cover_letter: message.trim(),
        proposed_contribution_type: 'time',
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Application submitted!',
        description: 'The organization will review your application and get back to you soon.',
      });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onOpenChange(false);
      setMessage('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply to {opportunity.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="message">Why are you interested in this opportunity?</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your motivation, relevant experience, and what you hope to contribute..."
              className="mt-2 min-h-[200px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={!message.trim() || applyMutation.isPending}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyDialog;

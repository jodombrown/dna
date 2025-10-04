import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ApplyDialogProps {
  opportunity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplyDialog: React.FC<ApplyDialogProps> = ({ opportunity, open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = React.useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Must be logged in');
      if (!profile?.onboarding_completed_at) {
        throw new Error('Please complete your profile first');
      }

      const { error } = await supabase.from('opportunity_applications').insert({
        opportunity_id: opportunity.id,
        applicant_id: user?.id,
        cover_letter: coverLetter.trim(),
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
      setCoverLetter('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    },
  });

  if (profileLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile?.onboarding_completed_at) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please complete your profile before applying to opportunities.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => window.location.href = '/onboarding'}>
            Complete Profile
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply to {opportunity.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Your Profile</Label>
            <div className="text-sm text-muted-foreground">
              {profile.full_name} • {profile.headline || 'No headline'}
            </div>
          </div>

          <div>
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why are you interested in this opportunity? What relevant experience do you have?"
              className="mt-2 min-h-[200px]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={!coverLetter.trim() || applyMutation.isPending}
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

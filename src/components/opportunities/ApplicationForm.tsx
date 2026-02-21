import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { diaEventBus } from '@/services/dia/diaEventBus';
import { platformNotifications } from '@/services/platformNotificationGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const applicationSchema = z.object({
  cover_letter: z.string().min(50, 'Cover letter must be at least 50 characters').max(2000, 'Cover letter must be less than 2000 characters'),
  resume_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  opportunityId: string;
  opportunityTitle: string;
  opportunityOwnerId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ApplicationForm({ opportunityId, opportunityTitle, opportunityOwnerId, onCancel, onSuccess }: ApplicationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cover_letter: '',
      resume_url: '',
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        opportunity_id: opportunityId,
        cover_letter: data.cover_letter,
        resume_url: data.resume_url || null,
        status: 'pending',
      });

      if (error) throw error;

      // DIA Sprint 4B: Emit opportunity response event for proactive nudges
      if (opportunityOwnerId && user) {
        diaEventBus.emit({
          type: 'opportunity_response',
          opportunityId,
          ownerId: opportunityOwnerId,
          responderId: user.id,
        });

        // Sprint 4C: In-app notification for opportunity interest
        platformNotifications.opportunityInterest(
          opportunityOwnerId,
          user.id,
          opportunityId,
          opportunityTitle
        ).catch(() => { /* non-critical */ });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', opportunityId] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error submitting application',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    submitApplication.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply to {opportunityTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cover_letter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us why you're a great fit for this opportunity..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resume_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume/Portfolio URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/your-resume.pdf"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitApplication.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitApplication.isPending}
                className="flex-1"
              >
                {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

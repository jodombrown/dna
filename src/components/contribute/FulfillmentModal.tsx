/**
 * DNA | Fulfillment Modal — Sprint 13D
 *
 * Modal for opportunity posters to mark an opportunity as fulfilled.
 * Uses Drawer (bottom sheet) on mobile for better UX.
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/services/notificationService';
import { useIsMobile } from '@/hooks/useMobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface FulfillmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  opportunityTitle: string;
}

const FulfillmentModal: React.FC<FulfillmentModalProps> = ({
  open,
  onOpenChange,
  opportunityId,
  opportunityTitle,
}) => {
  const [outcome, setOutcome] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fulfillMutation = useMutation({
    mutationFn: async () => {
      // Update opportunity status
      const { error: oppError } = await supabase
        .from('opportunities')
        .update({
          status: 'fulfilled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', opportunityId);

      if (oppError) throw oppError;

      // Notify accepted contributors
      const { data: accepted } = await supabase
        .from('opportunity_interests' as any)
        .select('user_id')
        .eq('opportunity_id', opportunityId)
        .eq('status', 'accepted');

      if (accepted) {
        for (const interest of accepted as { user_id: string }[]) {
          await createNotification({
            user_id: interest.user_id,
            type: 'opportunity_fulfilled',
            title: 'Opportunity fulfilled!',
            message: `The opportunity "${opportunityTitle}" has been fulfilled!${outcome ? ` Outcome: ${outcome}` : ''}`,
            link_url: '/dna/contribute',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity-interests', opportunityId] });
      toast({
        title: 'Opportunity fulfilled!',
        description: 'Contributors have been notified. Consider sharing this impact with a post.',
      });
      onOpenChange(false);
      setOutcome('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to mark as fulfilled. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium">Mark as fulfilled?</p>
          <p className="text-xs text-muted-foreground">
            This marks &ldquo;{opportunityTitle}&rdquo; as completed.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outcome" className="text-sm">
          Brief outcome description (optional)
        </Label>
        <Textarea
          id="outcome"
          placeholder="What was the result of this collaboration?"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex gap-2 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={fulfillMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={() => fulfillMutation.mutate()}
        disabled={fulfillMutation.isPending}
        className="bg-green-600 hover:bg-green-700"
      >
        {fulfillMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        )}
        Mark Fulfilled
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Fulfill Opportunity</DrawerTitle>
            <DrawerDescription>
              Mark this opportunity as successfully completed.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fulfill Opportunity</DialogTitle>
          <DialogDescription>
            Mark this opportunity as successfully completed.
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FulfillmentModal;

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Flag, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { messageService } from '@/services/messageService';

type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other';

interface ReportMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  senderName?: string;
}

const reportReasons: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Unsolicited promotional or repetitive content',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying, threats, or targeted abuse',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Offensive, explicit, or inappropriate material',
  },
  {
    value: 'scam',
    label: 'Scam or Fraud',
    description: 'Suspicious requests for money or personal information',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else not listed above',
  },
];

/**
 * ReportMessageDialog - Dialog for reporting messages
 *
 * Implements PRD requirement:
 * - Basic message reporting (block, report spam)
 */
const ReportMessageDialog: React.FC<ReportMessageDialogProps> = ({
  open,
  onOpenChange,
  messageId,
  senderName,
}) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: async () => {
      return messageService.reportMessage(
        messageId,
        reason,
        description.trim() || undefined
      );
    },
    onSuccess: () => {
      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe.',
      });
      onOpenChange(false);
      setReason('spam');
      setDescription('');
    },
    onError: (error: Error) => {
      if (error.message.includes('already reported') || error.message.includes('unique')) {
        toast({
          title: 'Already reported',
          description: 'You have already reported this message.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to submit report',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
  });

  const handleSubmit = () => {
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Message
          </DialogTitle>
          <DialogDescription>
            {senderName
              ? `Report this message from ${senderName}. Our team will review it.`
              : 'Report this message. Our team will review it.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this message?</Label>
            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
              className="space-y-2"
            >
              {reportReasons.map((r) => (
                <div key={r.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={r.value} id={r.value} className="mt-1" />
                  <div className="space-y-0.5">
                    <Label htmlFor={r.value} className="font-medium cursor-pointer">
                      {r.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help us review this report..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reportMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={reportMutation.isPending}
          >
            {reportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportMessageDialog;

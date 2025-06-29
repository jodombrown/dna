
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useContentFlags } from '@/hooks/useContentFlags';
import { Database } from '@/integrations/supabase/types';

type FlagType = Database['public']['Enums']['flag_type'];

interface ContentFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
  contentId: string;
  onSuccess?: () => void;
}

const ContentFlagDialog: React.FC<ContentFlagDialogProps> = ({
  open,
  onOpenChange,
  contentType,
  contentId,
  onSuccess
}) => {
  const [flagType, setFlagType] = useState<FlagType>('inappropriate_content');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createFlag } = useContentFlags();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const result = await createFlag(contentType, contentId, flagType, reason);
      
      if (result.success) {
        toast({
          title: "Content Flagged",
          description: "Thank you for reporting this content. Our moderation team will review it shortly.",
        });
        
        setReason('');
        setFlagType('inappropriate_content');
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to flag content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const flagOptions = [
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'copyright_violation', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="flag-type">Reason for Report</Label>
            <Select value={flagType} onValueChange={(value: FlagType) => setFlagType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {flagOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Additional Details (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide any additional context that might help our moderation team..."
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Reporting...' : 'Report Content'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentFlagDialog;

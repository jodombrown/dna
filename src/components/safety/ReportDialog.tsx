import React, { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';

const CATEGORIES = [
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'other', label: 'Other' },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId?: string;
  conversationId?: string;
  context?: string;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ open, onOpenChange, targetUserId, conversationId, context }) => {
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleSubmit = async () => {
    if (!category || !reason.trim()) return toast.error('Please fill all fields');
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const contentId = conversationId || targetUserId || '';
      await supabase.from('content_flags').insert({ content_id: contentId, content_type: context || 'unknown', flagged_by: user?.id, reason: `[${category}] ${reason}` });
      toast.success('Report submitted');
      await trackEvent('connect_content_reported', { category, context, target_user_id: targetUserId });
      onOpenChange(false);
      setCategory('');
      setReason('');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalHeader>
        <ResponsiveModalTitle>Report {context}</ResponsiveModalTitle>
        <ResponsiveModalDescription>Help us keep DNA safe.</ResponsiveModalDescription>
      </ResponsiveModalHeader>
      <div className="space-y-4 px-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Details</Label>
          <Textarea placeholder="Details..." value={reason} onChange={(e) => setReason(e.target.value)} rows={4} />
        </div>
      </div>
      <ResponsiveModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
      </ResponsiveModalFooter>
    </ResponsiveModal>
  );
};

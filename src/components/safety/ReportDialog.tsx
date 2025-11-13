import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

export const ReportDialog: React.FC<any> = ({ open, onOpenChange, targetUserId, conversationId, context }) => {
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
      await supabase.from('content_flags').insert({ content_id: contentId, content_type: context, flagged_by: user?.id, reason: `[${category}] ${reason}` });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {context}</DialogTitle>
          <DialogDescription>Help us keep DNA safe.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

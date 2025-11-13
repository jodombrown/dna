import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onBlockSuccess?: () => void;
}

export const BlockUserDialog: React.FC<BlockUserDialogProps> = ({ open, onOpenChange, userId, userName, onBlockSuccess }) => {
  const [reason, setReason] = useState('');
  const [blocking, setBlocking] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleBlock = async () => {
    setBlocking(true);
    try {
      const { data, error } = await supabase.rpc('block_user', { p_blocked_user_id: userId, p_reason: reason || null });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        toast.success(`${userName} has been blocked`);
        await trackEvent('connect_user_blocked', { target_user_id: userId });
        onBlockSuccess?.();
        onOpenChange(false);
        setReason('');
      } else {
        toast.error(result?.error || 'Failed to block user');
      }
    } catch (error) {
      toast.error('Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {userName}?</AlertDialogTitle>
          <AlertDialogDescription>This will remove any connection between you and {userName}.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="block-reason">Reason (optional)</Label>
          <Textarea id="block-reason" placeholder="Why are you blocking this user?" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={blocking}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={blocking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{blocking ? 'Blocking...' : 'Block User'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

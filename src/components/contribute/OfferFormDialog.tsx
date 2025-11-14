import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import type { ContributionNeedType } from '@/types/contributeTypes';

interface OfferFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  needId: string;
  spaceId: string;
  needType: ContributionNeedType;
}

const OfferFormDialog = ({ isOpen, onClose, needId, spaceId, needType }: OfferFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    message: '',
    offered_amount: '',
    offered_currency: 'USD',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload: any = {
        need_id: needId,
        space_id: spaceId,
        created_by: user.id,
        message: data.message,
      };

      if (needType === 'funding' && data.offered_amount) {
        payload.offered_amount = parseFloat(data.offered_amount);
        payload.offered_currency = data.offered_currency;
      }

      const { error } = await supabase
        .from('contribution_offers')
        .insert([payload]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Offer submitted',
        description: 'Your offer has been sent to the project leads for review',
      });
      queryClient.invalidateQueries({ queryKey: ['contribution-need'] });
      queryClient.invalidateQueries({ queryKey: ['need-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      setFormData({ message: '', offered_amount: '', offered_currency: 'USD' });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please provide a message with your offer',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(formData);
  };

  const getPlaceholder = () => {
    switch (needType) {
      case 'funding':
        return 'Describe your funding offer and any conditions or timeline...';
      case 'skills':
        return 'Describe your relevant experience and what skills you can contribute...';
      case 'time':
        return 'Describe your availability and time commitment...';
      case 'access':
        return 'Describe what introductions or access you can provide...';
      case 'resources':
        return 'Describe what tools, resources, or materials you can provide...';
      default:
        return 'Describe how you can help...';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Offer to Help</DialogTitle>
          <DialogDescription>
            Submit your offer to contribute to this need
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="message">
              Your Offer *
              {needType === 'skills' && ' (Relevant Experience)'}
              {needType === 'time' && ' (Availability & Commitment)'}
              {needType === 'access' && ' (Introductions & Resources)'}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={getPlaceholder()}
              rows={6}
              required
              className="mt-2"
            />
          </div>

          {needType === 'funding' && (
            <>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Payments are handled off-platform. DNA helps coordinate contributions but does not process funds.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="offered_amount">Amount Considering (Optional)</Label>
                  <Input
                    id="offered_amount"
                    type="number"
                    value={formData.offered_amount}
                    onChange={(e) => setFormData({ ...formData, offered_amount: e.target.value })}
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="offered_currency">Currency</Label>
                  <Select
                    value={formData.offered_currency}
                    onValueChange={(value) => setFormData({ ...formData, offered_currency: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ZAR">ZAR (R)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OfferFormDialog;

import { useState } from 'react';
import { useCreateOffer } from '@/hooks/useContributionMutations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const createOfferMutation = useCreateOffer();

  const [formData, setFormData] = useState({
    message: '',
    offered_amount: '',
    offered_currency: 'USD',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOfferMutation.mutate({
      needId,
      spaceId,
      message: formData.message,
      offeredAmount: formData.offered_amount ? parseFloat(formData.offered_amount) : undefined,
      offeredCurrency: formData.offered_currency,
    });
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
            <Button type="submit" disabled={createOfferMutation.isPending}>
              {createOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OfferFormDialog;

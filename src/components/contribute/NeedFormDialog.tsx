import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreateNeed } from '@/hooks/useContributionMutations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { ContributionNeed, ContributionNeedType, ContributionNeedPriority } from '@/types/contributeTypes';

interface NeedFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  existingNeed?: ContributionNeed;
}

const NeedFormDialog = ({ isOpen, onClose, spaceId, existingNeed }: NeedFormDialogProps) => {
  const { toast } = useToast();
  const createMutation = useCreateNeed();
  
  const [formData, setFormData] = useState({
    type: existingNeed?.type || 'funding' as ContributionNeedType,
    title: existingNeed?.title || '',
    description: existingNeed?.description || '',
    priority: existingNeed?.priority || 'normal' as ContributionNeedPriority,
    target_amount: existingNeed?.target_amount?.toString() || '',
    currency: existingNeed?.currency || 'USD',
    time_commitment: existingNeed?.time_commitment || '',
    duration: existingNeed?.duration || '',
    needed_by: existingNeed?.needed_by || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      spaceId,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      targetAmount: formData.target_amount ? parseFloat(formData.target_amount) : undefined,
      currency: formData.currency,
      timeCommitment: formData.time_commitment,
      duration: formData.duration,
      neededBy: formData.needed_by,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingNeed ? 'Edit Need' : 'Create New Need'}</DialogTitle>
          <DialogDescription>
            {existingNeed ? 'Update your contribution need' : 'Post what your space needs to succeed'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as ContributionNeedType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Seed funding for MVP development"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what you need and how it will be used..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as ContributionNeedPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="needed_by">Needed By</Label>
                <Input
                  id="needed_by"
                  type="date"
                  value={formData.needed_by}
                  onChange={(e) => setFormData({ ...formData, needed_by: e.target.value })}
                />
              </div>
            </div>

            {/* Type-specific fields */}
            {formData.type === 'funding' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
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
            )}

            {(formData.type === 'skills' || formData.type === 'time') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_commitment">Time Commitment</Label>
                  <Input
                    id="time_commitment"
                    value={formData.time_commitment}
                    onChange={(e) => setFormData({ ...formData, time_commitment: e.target.value })}
                    placeholder="e.g., 5-10 hours/week"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 months"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {mutation.isPending ? 'Saving...' : existingNeed ? 'Update Need' : 'Create Need'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NeedFormDialog;

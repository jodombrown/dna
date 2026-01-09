import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateInitiativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
}

export function CreateInitiativeDialog({ open, onOpenChange, spaceId }: CreateInitiativeDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    impact_area: '',
    target_date: '',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('initiatives')
        .insert({
          space_id: spaceId,
          title: formData.title,
          description: formData.description || null,
          impact_area: formData.impact_area || null,
          target_date: formData.target_date || null,
          status: 'active',
          creator_id: user.id,
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-initiatives', spaceId] });
      toast.success('Initiative created!');
      onOpenChange(false);
      setFormData({ title: '', description: '', impact_area: '', target_date: '' });
    },
    onError: (error) => {
      toast.error('Failed to create initiative', { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Initiative</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's this initiative about?"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the goals and scope..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="impact_area">Impact Area</Label>
            <Input
              id="impact_area"
              value={formData.impact_area}
              onChange={(e) => setFormData({ ...formData, impact_area: e.target.value })}
              placeholder="e.g., Education, Healthcare, Technology"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim() || createMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Initiative
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

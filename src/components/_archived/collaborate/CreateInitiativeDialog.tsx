import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { useCreateInitiative, useCreateMilestone } from '@/hooks/useCollaborate';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateInitiativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
}

interface MilestoneInput {
  id: string;
  title: string;
  target_date?: Date;
}

export function CreateInitiativeDialog({
  open,
  onOpenChange,
  spaceId,
}: CreateInitiativeDialogProps) {
  const createInitiative = useCreateInitiative();
  const createMilestone = useCreateMilestone();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: undefined as Date | undefined,
  });
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [newMilestone, setNewMilestone] = useState('');

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([
        ...milestones,
        { id: crypto.randomUUID(), title: newMilestone.trim() },
      ]);
      setNewMilestone('');
    }
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    try {
      // Create initiative
      const initiative = await createInitiative.mutateAsync({
        space_id: spaceId,
        title: formData.title,
        description: formData.description || undefined,
        target_date: formData.target_date?.toISOString().split('T')[0],
      });

      // Create milestones
      for (const milestone of milestones) {
        await createMilestone.mutateAsync({
          initiative_id: initiative.id,
          title: milestone.title,
          target_date: milestone.target_date?.toISOString().split('T')[0],
        });
      }

      // Reset form and close
      setFormData({ title: '', description: '', target_date: undefined });
      setMilestones([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create initiative:', error);
    }
  };

  const isSubmitting = createInitiative.isPending || createMilestone.isPending;
  const canSubmit = formData.title.trim().length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Initiative</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div>
            <Label htmlFor="initiative-title">Title *</Label>
            <Input
              id="initiative-title"
              placeholder="e.g., Q1 Mentorship Cohort"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="initiative-description">Description</Label>
            <Textarea
              id="initiative-description"
              placeholder="What is this initiative about? What outcomes are you aiming for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Target Date */}
          <div>
            <Label>Target Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1',
                    !formData.target_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_date
                    ? format(formData.target_date, 'PPP')
                    : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.target_date}
                  onSelect={(date) => setFormData({ ...formData, target_date: date })}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Milestones */}
          <div>
            <Label>Milestones (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Break down your initiative into key checkpoints
            </p>

            {/* Existing milestones */}
            {milestones.length > 0 && (
              <div className="space-y-2 mb-3">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                  >
                    <span className="w-6 h-6 flex items-center justify-center text-xs font-medium bg-primary/10 text-primary rounded-full">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm">{milestone.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add milestone input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a milestone..."
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddMilestone}
                disabled={!newMilestone.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Initiative'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

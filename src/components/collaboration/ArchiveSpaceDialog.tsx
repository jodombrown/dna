import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Archive, AlertTriangle, Loader2 } from 'lucide-react';

interface ArchiveSpaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
  onConfirm: (summary?: string, notifyMembers?: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function ArchiveSpaceDialog({
  isOpen,
  onClose,
  spaceName,
  onConfirm,
  isLoading = false,
}: ArchiveSpaceDialogProps) {
  const [summary, setSummary] = useState('');
  const [notifyMembers, setNotifyMembers] = useState(true);

  const handleConfirm = async () => {
    await onConfirm(summary.trim() || undefined, notifyMembers);
    // Reset form
    setSummary('');
    setNotifyMembers(true);
    onClose();
  };

  const handleClose = () => {
    setSummary('');
    setNotifyMembers(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            Archive Project
          </DialogTitle>
          <DialogDescription>
            You're about to archive <span className="font-semibold">"{spaceName}"</span>.
            Archived projects remain visible on your profile but are marked as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              This project can be reactivated later if needed. No data will be lost.
            </div>
          </div>

          {/* Project Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="text-sm font-medium">
              Project Summary (optional)
            </Label>
            <Textarea
              id="summary"
              placeholder="What was accomplished? Any lessons learned? Share key outcomes..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              This summary will be added to the project description for future reference.
            </p>
          </div>

          {/* Notify Members */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyMembers"
              checked={notifyMembers}
              onCheckedChange={(checked) => setNotifyMembers(checked as boolean)}
              disabled={isLoading}
            />
            <Label
              htmlFor="notifyMembers"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Notify team members about the archive
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Archive Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

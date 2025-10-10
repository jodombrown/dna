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
import { Loader2 } from 'lucide-react';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (note: string) => Promise<void>;
  targetUser: {
    full_name: string;
    headline?: string;
  } | null;
}

export const ConnectionRequestModal = ({
  isOpen,
  onClose,
  onSend,
  targetUser,
}: ConnectionRequestModalProps) => {
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSend(note);
      setNote(''); // Clear note after successful send
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setNote('');
      onClose();
    }
  };

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect with {targetUser.full_name}</DialogTitle>
          {targetUser.headline && (
            <DialogDescription>
              {targetUser.headline}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Add a note (optional)
            </label>
            <Textarea
              id="note"
              placeholder="Introduce yourself and explain why you'd like to connect..."
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {note.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Connection Request →'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

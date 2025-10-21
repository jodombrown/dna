import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
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
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const MAX_CHARS = 500;

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage('');
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (message.length > MAX_CHARS) return;
    
    setIsSending(true);
    try {
      await onSend(message);
      setMessage('');
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setMessage('');
      onClose();
    }
  };

  const isOverLimit = message.length > MAX_CHARS;

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[hsl(30,10%,10%)]">
            Connect with {targetUser.full_name}
          </DialogTitle>
          {targetUser.headline && (
            <DialogDescription className="text-[hsl(30,10%,60%)]">
              {targetUser.headline}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-[hsl(30,10%,10%)]">
              Add a personal note (optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Hi, I saw your work in renewable energy and would love to connect and discuss..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none border-[hsl(30,10%,80%)] focus:border-[hsl(151,75%,50%)]"
              autoFocus
            />
            <p className={`text-xs text-right ${
              isOverLimit 
                ? 'text-red-500 font-semibold' 
                : 'text-[hsl(30,10%,60%)]'
            }`}>
              {message.length}/{MAX_CHARS} characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
            className="border-[hsl(30,10%,80%)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || isOverLimit}
            className="bg-[hsl(151,75%,50%)] text-white hover:bg-[hsl(151,75%,40%)]"
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

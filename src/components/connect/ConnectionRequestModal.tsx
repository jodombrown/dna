import { useState, useEffect } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
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
    <ResponsiveModal open={isOpen} onOpenChange={handleClose} className="sm:max-w-[500px]">
      <ResponsiveModalHeader>
        <ResponsiveModalTitle className="text-xl font-semibold text-foreground">
          Connect with {targetUser.full_name}
        </ResponsiveModalTitle>
        {targetUser.headline && (
          <ResponsiveModalDescription className="text-muted-foreground">
            {targetUser.headline}
          </ResponsiveModalDescription>
        )}
      </ResponsiveModalHeader>

      <div className="space-y-4 py-4 px-4">
        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-medium text-foreground">
            Add a personal note (optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Hi, I saw your work in renewable energy and would love to connect and discuss..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="resize-none border-border focus:border-primary"
            autoFocus
          />
          <p className={`text-xs text-right ${
            isOverLimit 
              ? 'text-destructive font-semibold' 
              : 'text-muted-foreground'
          }`}>
            {message.length}/{MAX_CHARS} characters
          </p>
        </div>
      </div>

      <ResponsiveModalFooter className="gap-2 px-4 pb-4">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isSending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={isSending || isOverLimit}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
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
      </ResponsiveModalFooter>
    </ResponsiveModal>
  );
};

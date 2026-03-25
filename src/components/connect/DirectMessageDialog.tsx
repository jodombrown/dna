import React, { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Recipient {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface DirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: Recipient | null;
  onSend?: (recipientId: string, message: string) => void;
}

const DirectMessageDialog: React.FC<DirectMessageDialogProps> = ({ open, onOpenChange, recipient, onSend }) => {
  const [message, setMessage] = useState('');
  const disabled = !recipient || message.trim().length === 0;

  const handleSend = () => {
    if (!recipient) return;
    if (onSend) {
      onSend(recipient.id, message.trim());
    } else {
      toast.success(`Message sent to ${recipient.full_name}`);
    }
    setMessage('');
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalHeader>
        <ResponsiveModalTitle>Direct Message</ResponsiveModalTitle>
      </ResponsiveModalHeader>
      {recipient && (
        <div className="px-4 pb-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipient.avatar_url} alt={`Avatar of ${recipient.full_name}`} />
              <AvatarFallback>{recipient.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{recipient.full_name}</p>
              <p className="text-sm text-muted-foreground">Start a private conversation</p>
            </div>
          </div>

          <div>
            <label htmlFor="dm-message" className="sr-only">Message</label>
            <Textarea
              id="dm-message"
              placeholder={`Write a message to ${recipient.full_name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
      )}
      <ResponsiveModalFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="default" disabled={disabled} onClick={handleSend}>Send</Button>
      </ResponsiveModalFooter>
    </ResponsiveModal>
  );
};

export default DirectMessageDialog;

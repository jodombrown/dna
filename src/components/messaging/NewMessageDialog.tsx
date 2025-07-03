
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { Send } from 'lucide-react';

interface NewMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  onConversationCreated?: (conversationId: string) => void;
}

const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  onConversationCreated
}) => {
  const { createOrGetConversation } = useConversations();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { sendMessage } = useMessages(conversationId || undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setLoading(true);
    
    try {
      // Create or get conversation
      const convId = await createOrGetConversation(targetUserId);
      
      if (convId) {
        setConversationId(convId);
        
        // Send the message
        const success = await sendMessage(message);
        
        if (success) {
          setMessage('');
          onClose();
          
          if (onConversationCreated) {
            onConversationCreated(convId);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message to {targetUserName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageComposerProps {
  conversationId: string;
  currentUserId: string;
  onMessageSent?: () => void;
}

export function MessageComposer({
  conversationId,
  currentUserId,
  onMessageSent,
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const maxLength = 5000;

  useEffect(() => {
    // Auto-focus on mount
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || trimmedMessage.length === 0) {
      return;
    }

    if (trimmedMessage.length > maxLength) {
      toast({
        title: 'Message too long',
        description: `Messages must be ${maxLength} characters or less`,
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from('messages_new').insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: trimmedMessage,
      });

      if (error) throw error;

      setMessage('');
      onMessageSent?.();
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message... (Shift+Enter for new line)"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-1 px-1">
            <span className="text-xs text-muted-foreground">
              Press Enter to send
            </span>
            <span className="text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </span>
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          size="icon"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

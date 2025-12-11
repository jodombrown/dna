import React, { useState } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-3">
      <div className="flex items-end gap-2">
        {/* Attachment button - placeholder */}
        {/* <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button> */}

        {/* Input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-32 resize-none pr-12",
              "text-base md:text-sm", // 16px on mobile to prevent iOS zoom
              "bg-muted/50 border-0 focus-visible:ring-1 rounded-full py-3 px-4"
            )}
          />
        </div>

        {/* Send button */}
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

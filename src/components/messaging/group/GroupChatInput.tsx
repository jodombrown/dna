/**
 * GroupChatInput - Message input for group threads
 * 
 * Pill-shaped input with send button, typing broadcast on keydown.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupChatInputProps {
  onSend: (content: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

export function GroupChatInput({ onSend, onTyping, disabled }: GroupChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      onTyping?.();
    }
  };

  return (
    <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm px-4 py-3 safe-area-bottom">
      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-end bg-muted rounded-3xl border border-border/50 px-4 py-2">
          <textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 bg-transparent border-0 resize-none focus:outline-none focus:ring-0',
              'text-[15px] placeholder:text-muted-foreground/60',
              'min-h-[24px] max-h-[100px] py-0'
            )}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full flex-shrink-0 transition-all',
            message.trim()
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground scale-100 opacity-100'
              : 'bg-muted text-muted-foreground scale-90 opacity-50'
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

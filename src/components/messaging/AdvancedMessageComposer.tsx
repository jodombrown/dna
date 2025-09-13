import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  Bold, 
  Italic, 
  List,
  Link,
  AtSign,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedMessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const AdvancedMessageComposer: React.FC<AdvancedMessageComposerProps> = ({
  value,
  onChange,
  onSend,
  onTyping,
  placeholder = "Type your message...",
  disabled = false,
  className
}) => {
  const [showFormatting, setShowFormatting] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
    
    // Trigger typing indicator
    onTyping();
  };

  const insertFormatting = (type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'list':
        formattedText = `\n• ${selectedText || 'list item'}`;
        newCursorPos = selectedText ? end + 3 : start + 3;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const quickReplies = [
    "Thanks for connecting!",
    "I'd love to learn more",
    "Let's schedule a call",
    "Looking forward to collaborating",
    "Great to meet you!"
  ];

  return (
    <Card className={cn("p-4 border-t", className)}>
      {/* Quick Replies */}
      <div className="flex flex-wrap gap-2 mb-3">
        {quickReplies.slice(0, 3).map((reply, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-dna-emerald/10 hover:border-dna-emerald text-xs"
            onClick={() => onChange(reply)}
          >
            {reply}
          </Badge>
        ))}
      </div>

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="flex items-center gap-1 mb-2 p-2 bg-muted rounded">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('list')}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertFormatting('link')}
            className="h-8 w-8 p-0"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Message Input */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[80px] resize-none pr-12 border-dna-emerald/20 focus:border-dna-emerald"
          rows={3}
        />
        
        {/* Character Count */}
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
          {value.length}/1000
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFormatting(!showFormatting)}
            className="h-8 w-8 p-0"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
          size="sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>

      {/* Message Templates */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Hash className="w-3 h-3" />
          Quick Templates
        </div>
        <div className="flex flex-wrap gap-1">
          {quickReplies.slice(3).map((reply, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-dna-copper/10 text-xs"
              onClick={() => onChange(value + (value ? ' ' : '') + reply)}
            >
              {reply}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
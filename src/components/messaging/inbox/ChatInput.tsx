import React, { useState, useRef } from 'react';
import { Send, Paperclip, Image, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';

export interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  filename: string;
  filesize?: number;
  mimetype?: string;
}

interface ChatInputProps {
  onSend: (content: string, attachment?: MessageAttachment) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  const handleSend = () => {
    const trimmed = message.trim();
    if ((trimmed || attachment) && !disabled) {
      onSend(trimmed, attachment || undefined);
      setMessage('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = await uploadImage(file, 'message-attachments');
      if (url) {
        const isImage = file.type.startsWith('image/');
        setAttachment({
          type: isImage ? 'image' : 'file',
          url,
          filename: file.name,
          filesize: file.size,
          mimetype: file.type,
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="border-t border-border bg-card">
      {/* Attachment Preview */}
      {attachment && (
        <div className="px-3 pt-3">
          <div className="relative inline-block">
            {attachment.type === 'image' ? (
              <div className="relative">
                <img 
                  src={attachment.url} 
                  alt={attachment.filename}
                  className="h-20 w-auto rounded-lg object-cover"
                />
                <button
                  onClick={removeAttachment}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 pr-8">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px]">{attachment.filename}</span>
                <button
                  onClick={removeAttachment}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-end gap-2">
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
            className="hidden"
          />

          {/* Attachment button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>

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
                "min-h-[44px] max-h-32 resize-none",
                "text-base md:text-sm", // 16px on mobile to prevent iOS zoom
                "bg-muted/50 border-0 focus-visible:ring-1 rounded-full py-3 px-4"
              )}
            />
          </div>

          {/* Send button */}
          <Button 
            onClick={handleSend}
            disabled={(!message.trim() && !attachment) || disabled}
            size="icon"
            className="h-10 w-10 rounded-full flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

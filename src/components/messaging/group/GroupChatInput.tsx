/**
 * GroupChatInput - Message input for group threads
 * 
 * Pill-shaped input with send button, paperclip for media, typing broadcast on keydown.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, X, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mediaUploadService } from '@/services/mediaUploadService';
import { useToast } from '@/hooks/use-toast';
import type { MediaItem } from '@/types/groupMessaging';

interface GroupChatInputProps {
  onSend: (content: string, mediaUrls?: MediaItem[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
  conversationId?: string;
}

export function GroupChatInput({ onSend, onTyping, disabled, conversationId }: GroupChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all
    for (const file of files) {
      const err = mediaUploadService.validateFile(file);
      if (err) {
        toast({ title: 'Invalid file', description: err, variant: 'destructive' });
        return;
      }
    }

    if (!conversationId) {
      toast({ title: 'Error', description: 'No conversation selected', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const uploaded = await mediaUploadService.uploadMultiple(files, conversationId);
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Could not upload file. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const hasContent = message.trim() || attachments.length > 0;

  return (
    <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm px-4 py-3 safe-area-bottom">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {attachments.map((att, i) => (
            <div key={i} className="relative">
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="h-14 px-3 flex items-center gap-2 bg-muted rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs truncate max-w-[80px]">{att.name}</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          multiple
          className="hidden"
        />

        {/* Paperclip button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0 hover:bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

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
          disabled={disabled || !hasContent}
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full flex-shrink-0 transition-all',
            hasContent
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

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useLinkPreview, extractFirstUrl } from '@/hooks/useLinkPreview';
import { LinkPreview } from './LinkPreview';
import { VoiceMessageRecorder } from './VoiceMessageRecorder';

export interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  filename: string;
  filesize?: number;
  mimetype?: string;
}

export interface MessageLinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface ChatInputProps {
  onSend: (content: string, attachment?: MessageAttachment, linkPreview?: MessageLinkPreview) => void;
  onSendVoice?: (audioBlob: Blob, duration: number) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onSendVoice,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [isVoiceRecorderActive, setIsVoiceRecorderActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();
  
  // Detect links for preview
  const { previews, loading: previewLoading } = useLinkPreview(message);
  const detectedUrl = extractFirstUrl(message);
  const linkPreview = previews[0];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Min height ~44px (1 row), max ~120px (~4 rows for ~150 chars)
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 120)}px`;
    }
  }, [message]);

  // Remove URL from message text when sending if link preview exists
  const getCleanedMessage = () => {
    if (linkPreview && detectedUrl) {
      return message.replace(detectedUrl, '').trim();
    }
    return message.trim();
  };

  const handleSend = () => {
    const cleanedMessage = getCleanedMessage();
    if ((cleanedMessage || attachment || linkPreview) && !disabled) {
      // Pass link preview data when sending
      const linkPreviewData: MessageLinkPreview | undefined = linkPreview ? {
        url: linkPreview.url,
        title: linkPreview.title,
        description: linkPreview.description,
        image: linkPreview.image,
        siteName: linkPreview.siteName,
      } : undefined;
      
      onSend(cleanedMessage, attachment || undefined, linkPreviewData);
      setMessage('');
      setAttachment(null);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
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
      {/* Link Preview - shown before sending */}
      {linkPreview && !attachment && (
        <div className="px-3 pt-3">
          <div className="relative">
            <LinkPreview preview={linkPreview} isOwn={false} />
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-2 min-w-0">
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
            className="hidden"
          />

          {/* Attachment button - hide when voice recorder is active */}
          {!isVoiceRecorderActive && (
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
          )}

          {/* Voice Message Recorder - takes over when active */}
          {onSendVoice && !message.trim() && !attachment && (
            <VoiceMessageRecorder 
              onSendVoice={onSendVoice} 
              disabled={disabled}
              onActiveStateChange={setIsVoiceRecorderActive}
            />
          )}

          {/* Input - hide when voice recorder is active */}
          {!isVoiceRecorderActive && (
            <div className="flex-1 min-w-0">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                rows={1}
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none",
                  "text-base md:text-sm", // 16px on mobile to prevent iOS zoom
                  "bg-muted/50 border-0 focus-visible:ring-1 rounded-2xl py-3 px-4"
                )}
              />
            </div>
          )}

          {/* Send button - show when there's content */}
          {(message.trim() || attachment || linkPreview) && !isVoiceRecorderActive && (
            <Button 
              onClick={handleSend}
              disabled={(!message.trim() && !attachment && !linkPreview) || disabled}
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Loader2 } from 'lucide-react';
import type { UserTag, ContentType } from '@/types/feedback';
import { USER_TAG_LABELS } from '@/types/feedback';
import { feedbackService } from '@/services/feedbackService';
import { FeedbackMediaUpload } from './FeedbackMediaUpload';
import { FeedbackVoiceRecorder } from './FeedbackVoiceRecorder';
import { FeedbackVideoRecorder } from './FeedbackVideoRecorder';
import { toast } from 'sonner';

interface FeedbackComposerProps {
  channelId: string;
  replyTo?: {
    id: string;
    username: string;
    preview: string;
  } | null;
  onCancelReply?: () => void;
  onSuccess?: () => void;
}

const TAG_OPTIONS: UserTag[] = ['bug', 'suggestion', 'question', 'praise', 'other'];

interface PendingAttachment {
  file: File | Blob;
  type: 'image' | 'voice' | 'video';
  preview?: string;
  duration?: number;
}

export function FeedbackComposer({
  channelId,
  replyTo,
  onCancelReply,
  onSuccess,
}: FeedbackComposerProps) {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<UserTag | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newAttachments: PendingAttachment[] = files.map((file) => ({
      file,
      type: 'image' as const,
      preview: URL.createObjectURL(file),
    }));
    setPendingAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setPendingAttachments((prev) => {
      const attachment = prev[index];
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleVoiceRecording = useCallback((blob: Blob, duration: number) => {
    setPendingAttachments((prev) => [
      ...prev,
      { file: blob, type: 'voice', duration },
    ]);
    setShowMediaOptions(false);
  }, []);

  const handleVideoRecording = useCallback((blob: Blob, duration: number) => {
    setPendingAttachments((prev) => [
      ...prev,
      { file: blob, type: 'video', duration },
    ]);
    setShowMediaOptions(false);
  }, []);

  const determineContentType = (): ContentType => {
    if (pendingAttachments.length === 0) return 'text';
    if (pendingAttachments.length === 1) {
      return pendingAttachments[0].type;
    }
    return 'mixed';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && pendingAttachments.length === 0) return;

    try {
      setIsSubmitting(true);

      // First, create the message
      const message = await feedbackService.sendMessage({
        channelId,
        content: content.trim(),
        contentType: determineContentType(),
        userTag: selectedTag || undefined,
        parentMessageId: replyTo?.id,
      });

      if (!message) {
        throw new Error('Failed to send message');
      }

      // Then upload attachments
      for (const attachment of pendingAttachments) {
        const file = attachment.file instanceof File
          ? attachment.file
          : new File([attachment.file], `${attachment.type}_${Date.now()}.webm`, {
              type: attachment.file.type,
            });

        await feedbackService.uploadAttachment(message.id, file, attachment.type);
      }

      // Reset form
      setContent('');
      setSelectedTag(null);
      setPendingAttachments([]);
      onCancelReply?.();
      onSuccess?.();
      toast.success('Feedback sent!');
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded">
          <span className="flex-1 truncate">
            Replying to <span className="font-medium">@{replyTo.username}</span>:{' '}
            <span className="italic">"{replyTo.preview.slice(0, 50)}..."</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Attachment Previews */}
      {pendingAttachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {pendingAttachments.map((attachment, index) => (
            <div key={index} className="relative group">
              {attachment.type === 'image' && attachment.preview && (
                <img
                  src={attachment.preview}
                  alt={`Preview ${index + 1}`}
                  className="h-16 w-16 object-cover rounded border"
                />
              )}
              {attachment.type === 'voice' && (
                <div className="h-16 px-3 flex items-center gap-2 bg-muted rounded border">
                  <span className="text-lg">🎤</span>
                  <span className="text-sm text-muted-foreground">
                    Voice ({Math.floor((attachment.duration || 0) / 60)}:{((attachment.duration || 0) % 60).toString().padStart(2, '0')})
                  </span>
                </div>
              )}
              {attachment.type === 'video' && (
                <div className="h-16 px-3 flex items-center gap-2 bg-muted rounded border">
                  <span className="text-lg">🎥</span>
                  <span className="text-sm text-muted-foreground">
                    Video ({Math.floor((attachment.duration || 0) / 60)}:{((attachment.duration || 0) % 60).toString().padStart(2, '0')})
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Media Recording UI */}
      {showMediaOptions && (
        <div className="mb-3 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-start gap-6 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Voice Note</p>
              <FeedbackVoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Video Clip</p>
              <FeedbackVideoRecorder
                onRecordingComplete={handleVideoRecording}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaOptions(false)}
            className="mt-2 text-xs"
          >
            Hide media options
          </Button>
        </div>
      )}

      {/* Input Row */}
      <div className="flex gap-2 items-end">
        {/* Media Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <FeedbackMediaUpload
            onFilesSelected={handleFilesSelected}
            selectedFiles={pendingAttachments.filter((a) => a.type === 'image').map((a) => a.file as File)}
            onRemoveFile={() => {}}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaOptions(!showMediaOptions)}
            className="h-8 px-2"
            title="Record voice or video"
          >
            🎤
          </Button>
        </div>

        {/* Text Input */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share your feedback..."
          className="min-h-[60px] resize-none flex-1"
          maxLength={5000}
          disabled={isSubmitting}
        />

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={(!content.trim() && pendingAttachments.length === 0) || isSubmitting}
          className="h-10 w-10 shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Tag Selector */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Tag:</span>
        {TAG_OPTIONS.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant={selectedTag === tag ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className="h-7 text-xs"
            disabled={isSubmitting}
          >
            #{USER_TAG_LABELS[tag]}
          </Button>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Press Cmd/Ctrl + Enter to send
      </p>
    </form>
  );
}

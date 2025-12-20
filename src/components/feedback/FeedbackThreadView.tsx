import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FeedbackMessage } from './FeedbackMessage';
import { FeedbackComposer } from './FeedbackComposer';
import { useFeedbackThread } from '@/hooks/useFeedbackMessages';
import { feedbackService } from '@/services/feedbackService';
import type { FeedbackMessageWithSender } from '@/types/feedback';

interface FeedbackThreadViewProps {
  parentMessage: FeedbackMessageWithSender;
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export function FeedbackThreadView({
  parentMessage,
  channelId,
  isOpen,
  onClose,
  isAdmin = false,
}: FeedbackThreadViewProps) {
  const { data: replies, isLoading, refetch } = useFeedbackThread(isOpen ? parentMessage.id : null);

  const handleReplySuccess = () => {
    refetch();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle>Thread</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Parent Message */}
          <FeedbackMessage
            message={parentMessage}
            channelId={channelId}
            isAdmin={isAdmin}
          />

          {/* Replies Header */}
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground px-2">
              {parentMessage.reply_count} {parentMessage.reply_count === 1 ? 'reply' : 'replies'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Replies */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : replies && replies.length > 0 ? (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              {replies.map((reply) => (
                <FeedbackMessage
                  key={reply.id}
                  message={reply}
                  channelId={channelId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No replies yet. Be the first to respond!
            </p>
          )}
        </div>

        {/* Reply Composer */}
        <FeedbackComposer
          channelId={channelId}
          replyTo={{
            id: parentMessage.id,
            username: parentMessage.sender?.username || 'anonymous',
            preview: parentMessage.content || '',
          }}
          onCancelReply={onClose}
          onSuccess={handleReplySuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

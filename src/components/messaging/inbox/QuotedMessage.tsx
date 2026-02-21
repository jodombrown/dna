import React from 'react';
import { Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReplyToData } from '@/services/messageTypes';

interface QuotedMessageProps {
  replyTo: ReplyToData;
  isOwn: boolean;
  onClickQuote?: () => void;
}

export const QuotedMessage: React.FC<QuotedMessageProps> = ({
  replyTo,
  isOwn,
  onClickQuote,
}) => {
  const truncatedContent = replyTo.content.length > 80
    ? `${replyTo.content.slice(0, 80)}...`
    : replyTo.content;

  return (
    <button
      onClick={onClickQuote}
      className={cn(
        "flex items-start gap-1.5 rounded-lg px-2 py-1.5 mb-1 w-full text-left",
        "border-l-[3px] transition-colors",
        isOwn
          ? "bg-primary/5 border-l-primary/40 hover:bg-primary/10"
          : "bg-muted/40 border-l-muted-foreground/30 hover:bg-muted/60"
      )}
      type="button"
    >
      <Reply className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-muted-foreground truncate">
          {replyTo.senderName}
        </p>
        <p className="text-[11px] text-muted-foreground/80 truncate">
          {truncatedContent || 'Attachment'}
        </p>
      </div>
    </button>
  );
};

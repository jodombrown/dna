import React from 'react';
import { X, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyPreviewBarProps {
  senderName: string;
  content: string;
  onCancel: () => void;
}

export const ReplyPreviewBar: React.FC<ReplyPreviewBarProps> = ({
  senderName,
  content,
  onCancel,
}) => {
  const truncatedContent = content.length > 100
    ? `${content.slice(0, 100)}...`
    : content;

  return (
    <div className="px-2.5 pt-2">
      <div className={cn(
        "flex items-start gap-2 rounded-lg px-3 py-2",
        "bg-muted/60 border-l-[3px] border-l-primary"
      )}>
        <Reply className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">
            Replying to {senderName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {truncatedContent || 'Attachment'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-0.5 rounded hover:bg-muted-foreground/10 flex-shrink-0"
          aria-label="Cancel reply"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

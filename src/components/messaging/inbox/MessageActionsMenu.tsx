import React from 'react';
import { MoreVertical, Copy, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface MessageActionsMenuProps {
  messageId: string;
  content: string;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export const MessageActionsMenu: React.FC<MessageActionsMenuProps> = ({
  messageId,
  content,
  isOwn,
  onDelete,
  onReport,
}) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(messageId);
    } else {
      toast({
        title: "Delete message",
        description: "This feature is coming soon",
      });
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport(messageId);
    } else {
      toast({
        title: "Report submitted",
        description: "Thank you for reporting this message. We'll review it shortly.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-48">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Message
        </DropdownMenuItem>

        {isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Message
            </DropdownMenuItem>
          </>
        )}

        {!isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReport}>
              <Flag className="h-4 w-4 mr-2" />
              Report Message
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

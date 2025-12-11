import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Archive, ArchiveRestore, BellOff, Bell, Trash2 } from 'lucide-react';

interface ConversationActionsProps {
  isArchived: boolean;
  isMuted: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onDelete?: () => void;
}

export const ConversationActions: React.FC<ConversationActionsProps> = ({
  isArchived,
  isMuted,
  onArchive,
  onUnarchive,
  onMute,
  onUnmute,
  onDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isArchived ? (
          <DropdownMenuItem onClick={onUnarchive}>
            <ArchiveRestore className="mr-2 h-4 w-4" />
            Unarchive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        )}
        
        {isMuted ? (
          <DropdownMenuItem onClick={onUnmute}>
            <Bell className="mr-2 h-4 w-4" />
            Unmute notifications
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onMute}>
            <BellOff className="mr-2 h-4 w-4" />
            Mute notifications
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete conversation
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

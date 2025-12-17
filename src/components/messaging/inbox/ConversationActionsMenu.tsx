import React, { useState } from 'react';
import { MoreVertical, User, BellOff, Bell, Trash2, Ban, Flag, Archive, Pin, PinOff, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ConversationActionsMenuProps {
  otherUser: {
    id: string;
    username: string;
    full_name: string;
  };
  conversationId: string;
  isMuted?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  onMuteToggle?: () => void;
  onPinToggle?: () => void;
  onArchiveToggle?: () => void;
  onDeleteConversation?: () => void;
  onBlockUser?: () => void;
  onReportUser?: () => void;
}

export const ConversationActionsMenu: React.FC<ConversationActionsMenuProps> = ({
  otherUser,
  conversationId,
  isMuted = false,
  isPinned = false,
  isArchived = false,
  onMuteToggle,
  onPinToggle,
  onArchiveToggle,
  onDeleteConversation,
  onBlockUser,
  onReportUser,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleViewProfile = () => {
    navigate(`/dna/${otherUser.username}`);
  };

  const handleMuteToggle = () => {
    if (onMuteToggle) {
      onMuteToggle();
    }
  };

  const handlePinToggle = () => {
    if (onPinToggle) {
      onPinToggle();
    }
  };

  const handleArchiveToggle = () => {
    if (onArchiveToggle) {
      onArchiveToggle();
    }
  };

  const handleDeleteConversation = () => {
    if (onDeleteConversation) {
      onDeleteConversation();
      setShowDeleteDialog(false);
    }
  };

  const handleBlockUser = () => {
    if (onBlockUser) {
      onBlockUser();
    } else {
      toast({
        title: "Block user",
        description: "This feature is coming soon",
      });
    }
  };

  const handleReportUser = () => {
    if (onReportUser) {
      onReportUser();
    } else {
      toast({
        title: "Report user",
        description: "This feature is coming soon",
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleViewProfile}>
            <User className="h-4 w-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handlePinToggle}>
            {isPinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin Conversation
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin Conversation
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleArchiveToggle}>
            {isArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Unarchive Conversation
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Archive Conversation
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleMuteToggle}>
            {isMuted ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Unmute Notifications
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Mute Notifications
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Conversation
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleBlockUser}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            Block {otherUser.full_name}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleReportUser}>
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the conversation from your inbox. The other person will still be able to see the messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
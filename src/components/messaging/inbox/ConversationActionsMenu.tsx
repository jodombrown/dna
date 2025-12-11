import React from 'react';
import { MoreVertical, User, BellOff, Bell, Trash2, Ban, Flag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  onMuteToggle?: () => void;
  onDeleteConversation?: () => void;
  onBlockUser?: () => void;
  onReportUser?: () => void;
}

export const ConversationActionsMenu: React.FC<ConversationActionsMenuProps> = ({
  otherUser,
  conversationId,
  isMuted = false,
  onMuteToggle,
  onDeleteConversation,
  onBlockUser,
  onReportUser,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewProfile = () => {
    navigate(`/dna/${otherUser.username}`);
  };

  const handleMuteToggle = () => {
    if (onMuteToggle) {
      onMuteToggle();
    } else {
      toast({
        title: isMuted ? "Notifications unmuted" : "Notifications muted",
        description: isMuted 
          ? `You'll receive notifications from ${otherUser.full_name}`
          : `You won't receive notifications from ${otherUser.full_name}`,
      });
    }
  };

  const handleDeleteConversation = () => {
    if (onDeleteConversation) {
      onDeleteConversation();
    } else {
      toast({
        title: "Delete conversation",
        description: "This feature is coming soon",
      });
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
          onClick={handleDeleteConversation}
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
  );
};

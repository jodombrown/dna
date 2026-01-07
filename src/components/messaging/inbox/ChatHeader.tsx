import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ConversationActionsMenu } from './ConversationActionsMenu';

interface ChatHeaderProps {
  otherUser: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  conversationId: string;
  isMuted?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  onBack: () => void;
  onMuteToggle?: () => void;
  onPinToggle?: () => void;
  onArchiveToggle?: () => void;
  onDeleteConversation?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  otherUser, 
  conversationId,
  isMuted = false,
  isPinned = false,
  isArchived = false,
  onBack,
  onMuteToggle,
  onPinToggle,
  onArchiveToggle,
  onDeleteConversation,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b border-border/50 bg-[#075e54] dark:bg-zinc-900">
      {/* Back Button */}
      <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 text-white hover:bg-white/10">
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* User Info - Tap to view profile */}
      <button 
        onClick={() => navigate(`/dna/${otherUser.username}`)}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="h-10 w-10 border-2 border-white/20">
          <AvatarImage src={otherUser.avatar_url} />
          <AvatarFallback className="bg-white/20 text-white font-semibold">
            {otherUser.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-left min-w-0 flex-1">
          <h2 className="font-semibold text-white text-sm truncate">{otherUser.full_name}</h2>
          <p className="text-xs text-white/70 truncate">tap here for contact info</p>
        </div>
      </button>

      {/* Actions Menu */}
      <div className="[&_button]:text-white [&_button:hover]:bg-white/10">
        <ConversationActionsMenu
          otherUser={otherUser}
          conversationId={conversationId}
          isMuted={isMuted}
          isPinned={isPinned}
          isArchived={isArchived}
          onMuteToggle={onMuteToggle}
          onPinToggle={onPinToggle}
          onArchiveToggle={onArchiveToggle}
          onDeleteConversation={onDeleteConversation}
        />
      </div>
    </div>
  );
};
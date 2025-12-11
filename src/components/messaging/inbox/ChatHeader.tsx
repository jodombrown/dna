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
  onBack: () => void;
  onDeleteConversation?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  otherUser, 
  conversationId,
  onBack,
  onDeleteConversation,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
      {/* Back Button */}
      <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 md:hidden">
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* User Info */}
      <button 
        onClick={() => navigate(`/dna/${otherUser.username}`)}
        className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {otherUser.full_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <h2 className="font-semibold text-sm">{otherUser.full_name}</h2>
          <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
        </div>
      </button>

      {/* Actions Menu */}
      <ConversationActionsMenu
        otherUser={otherUser}
        conversationId={conversationId}
        onDeleteConversation={onDeleteConversation}
      />
    </div>
  );
};

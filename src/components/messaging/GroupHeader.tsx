import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Conversation, ConversationParticipant, ParticipantPreview } from '@/types/messagingPRD';

interface GroupHeaderProps {
  conversation: Conversation;
  participants: ParticipantPreview[];
  onBack: () => void;
  onOpenInfo: () => void;
}

export function GroupHeader({
  conversation,
  participants,
  onBack,
  onOpenInfo,
}: GroupHeaderProps) {
  const memberCount = conversation.participantCount || participants.length;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 border-b border-primary/20 bg-gradient-to-r from-primary to-primary/90">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-8 w-8 text-primary-foreground hover:bg-white/15"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <button
        onClick={onOpenInfo}
        className="flex items-center gap-2.5 flex-1 min-w-0"
      >
        <div className="relative h-9 w-9">
          {participants.length >= 2 ? (
            <div className="relative h-9 w-9">
              <Avatar className="h-6 w-6 absolute top-0 left-0 border border-primary">
                <AvatarImage src={participants[0]?.avatarUrl || undefined} />
                <AvatarFallback className="text-[10px] bg-white/20 text-primary-foreground">
                  {participants[0]?.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6 absolute bottom-0 right-0 border border-primary">
                <AvatarImage src={participants[1]?.avatarUrl || undefined} />
                <AvatarFallback className="text-[10px] bg-white/20 text-primary-foreground">
                  {participants[1]?.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="text-left min-w-0 flex-1">
          <h2 className="font-semibold text-primary-foreground text-sm leading-tight truncate">
            {conversation.title || 'Group'}
          </h2>
          <p className="text-[11px] text-primary-foreground/70 truncate">
            {memberCount} member{memberCount !== 1 ? 's' : ''} &middot; tap for info
          </p>
        </div>
      </button>
    </div>
  );
}

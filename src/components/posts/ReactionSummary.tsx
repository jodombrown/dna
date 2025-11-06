import React from 'react';
import { ReactionEmoji, getEmojiLabel } from '@/types/reactions';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReactionData {
  emoji: ReactionEmoji;
  count: number;
  users: {
    user_id: string;
    full_name: string;
    avatar_url?: string;
  }[];
}

interface ReactionSummaryProps {
  reactions: ReactionData[];
  totalCount: number;
}

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  reactions,
  totalCount,
}) => {
  if (totalCount === 0) return null;

  // Show top 3 reactions
  const topReactions = reactions.slice(0, 3);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <div className="flex items-center -space-x-1">
            {topReactions.map((reaction) => (
              <span
                key={reaction.emoji}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border text-sm"
                title={getEmojiLabel(reaction.emoji)}
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
          <span>{totalCount}</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-3">
          {reactions.map((reaction) => (
            <div key={reaction.emoji} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{reaction.emoji}</span>
                <span className="font-semibold text-sm">
                  {getEmojiLabel(reaction.emoji)}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {reaction.count}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {reaction.users.slice(0, 5).map((user) => (
                  <div key={user.user_id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback className="text-xs">
                        {user.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{user.full_name}</span>
                  </div>
                ))}
                {reaction.users.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{reaction.users.length - 5} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

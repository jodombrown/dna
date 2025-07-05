import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  postId: string;
  userReaction: string | null;
  reactionCounts: { type: string; count: number }[];
  onReactionClick: (type: 'like' | 'support' | 'join' | 'celebrate' | 'insightful') => void;
  disabled?: boolean;
}

const ReactionBar = ({ 
  postId, 
  userReaction, 
  reactionCounts, 
  onReactionClick, 
  disabled = false 
}: ReactionBarProps) => {
  const reactions = [
    { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-600' },
    { type: 'support', emoji: '🤝', label: 'Support', color: 'text-green-600' },
    { type: 'join', emoji: '✋', label: 'Join', color: 'text-dna-emerald' },
    { type: 'celebrate', emoji: '🎉', label: 'Celebrate', color: 'text-yellow-600' },
    { type: 'insightful', emoji: '💡', label: 'Insightful', color: 'text-purple-600' }
  ] as const;

  const getReactionCount = (type: string) => {
    return reactionCounts.find(r => r.type === type)?.count || 0;
  };

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t">
      {reactions.map((reaction) => {
        const count = getReactionCount(reaction.type);
        const isActive = userReaction === reaction.type;
        
        return (
          <Button
            key={reaction.type}
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onReactionClick(reaction.type)}
            className={cn(
              "h-8 px-3 transition-all duration-200",
              isActive 
                ? `bg-gray-100 ${reaction.color} font-medium` 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            )}
          >
            <span className="text-base mr-1">{reaction.emoji}</span>
            <span className="text-xs">
              {reaction.label}
              {count > 0 && (
                <span className="ml-1 font-medium">
                  {count}
                </span>
              )}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default ReactionBar;
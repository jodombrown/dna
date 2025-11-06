import React from 'react';
import { cn } from '@/lib/utils';
import { REACTION_EMOJIS, ReactionType } from '@/types/reactions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionType) => void;
  children: React.ReactNode;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onReactionSelect,
  children,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleReactionClick = (reaction: ReactionType) => {
    onReactionSelect(reaction);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex items-center gap-2">
          {(Object.entries(REACTION_EMOJIS) as [ReactionType, typeof REACTION_EMOJIS[ReactionType]][]).map(([type, data]) => (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-all hover:scale-110',
                'group'
              )}
              title={data.label}
            >
              <span className="text-2xl">{data.emoji}</span>
              <span className={cn('text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity', data.color)}>
                {data.label}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

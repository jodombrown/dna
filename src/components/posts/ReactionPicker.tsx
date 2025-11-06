import React, { lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { QUICK_REACTIONS, ReactionEmoji } from '@/types/reactions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Loader2 } from 'lucide-react';
import type { Theme, Categories } from 'emoji-picker-react';

// Lazy load emoji picker for performance
const EmojiPicker = lazy(() => import('emoji-picker-react'));

interface ReactionPickerProps {
  onReactionSelect: (reaction: ReactionEmoji) => void;
  children: React.ReactNode;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onReactionSelect,
  children,
}) => {
  const [open, setOpen] = React.useState(false);
  const [showFullPicker, setShowFullPicker] = React.useState(false);

  const handleQuickReaction = (emoji: ReactionEmoji) => {
    onReactionSelect(emoji);
    setOpen(false);
    setShowFullPicker(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    onReactionSelect(emojiData.emoji);
    setOpen(false);
    setShowFullPicker(false);
    
    // Track recently used (optional for future enhancement)
    const recents = JSON.parse(localStorage.getItem('dna-recent-emojis') || '[]');
    const updated = [emojiData.emoji, ...recents.filter((e: string) => e !== emojiData.emoji)].slice(0, 12);
    localStorage.setItem('dna-recent-emojis', JSON.stringify(updated));
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setShowFullPicker(false);
    }}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border shadow-lg" align="start" sideOffset={5}>
        {!showFullPicker ? (
          // Quick Reactions Bar
          <div className="flex items-center gap-1 p-2">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickReaction(emoji)}
                className={cn(
                  'flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-all hover:scale-110',
                  'w-10 h-10'
                )}
                title={emoji}
              >
                <span className="text-2xl">{emoji}</span>
              </button>
            ))}
            
            {/* Plus button to open full picker */}
            <button
              onClick={() => setShowFullPicker(true)}
              className={cn(
                'flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-all',
                'w-10 h-10 border-l ml-1 pl-2'
              )}
              title="More reactions"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ) : (
          // Full Emoji Picker
          <div className="bg-background">
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={'auto' as Theme}
                width={350}
                height={400}
                previewConfig={{ showPreview: false }}
                searchPlaceHolder="Search emojis..."
              />
            </Suspense>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMentionAutocomplete, MentionSuggestion } from '@/hooks/useMentionAutocomplete';

interface MentionAutocompleteProps {
  text: string;
  cursorPosition: number;
  onSelectMention: (mention: MentionSuggestion, startPos: number, endPos: number) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * Autocomplete dropdown for @mentions
 * Shows when user types @ followed by characters
 */
export const MentionAutocomplete = ({
  text,
  cursorPosition,
  onSelectMention,
  textareaRef,
}: MentionAutocompleteProps) => {
  const [mentionTrigger, setMentionTrigger] = useState<{
    query: string;
    startPos: number;
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect @ trigger and extract query
  useEffect(() => {
    const beforeCursor = text.substring(0, cursorPosition);

    // Find the last @ before cursor
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) {
      setMentionTrigger(null);
      return;
    }

    // Check if there's a space or start of text before the @
    const charBeforeAt = lastAtIndex > 0 ? beforeCursor[lastAtIndex - 1] : ' ';
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
      setMentionTrigger(null);
      return;
    }

    // Extract the query after @
    const afterAt = beforeCursor.substring(lastAtIndex + 1);

    // Check if there's a space after @ (which would end the mention)
    if (afterAt.includes(' ') || afterAt.includes('\n')) {
      setMentionTrigger(null);
      return;
    }

    // Valid mention trigger
    setMentionTrigger({
      query: afterAt,
      startPos: lastAtIndex,
    });
    setSelectedIndex(0);
  }, [text, cursorPosition]);

  const { data: suggestions = [] } = useMentionAutocomplete(
    mentionTrigger?.query || '',
    !!mentionTrigger
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!mentionTrigger || suggestions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && suggestions.length > 0) {
        e.preventDefault();
        handleSelectMention(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setMentionTrigger(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mentionTrigger, suggestions, selectedIndex]);

  const handleSelectMention = (mention: MentionSuggestion) => {
    if (!mentionTrigger) return;

    const endPos = cursorPosition;
    onSelectMention(mention, mentionTrigger.startPos, endPos);
    setMentionTrigger(null);
  };

  if (!mentionTrigger || suggestions.length === 0) {
    return null;
  }

  // Calculate dropdown position relative to textarea
  const getDropdownPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length;
    const lineHeight = 24; // Approximate line height in pixels

    return {
      top: currentLine * lineHeight,
      left: 16, // Offset from left edge
    };
  };

  const position = getDropdownPosition();

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-background border border-border rounded-lg shadow-lg max-w-sm w-full"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="p-2">
        <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
          Mention a connection
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelectMention(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={suggestion.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {suggestion.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-medium truncate">{suggestion.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{suggestion.username}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

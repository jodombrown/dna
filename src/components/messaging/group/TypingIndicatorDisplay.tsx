/**
 * TypingIndicatorDisplay - Shows who's typing with animated dots
 * 
 * Grammar: 1 = "{name} is typing...", 2 = "{name} and {name}", 3+ = "Several people"
 * No DB writes -- broadcast only.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { TypingUser } from '@/types/groupMessaging';

interface TypingIndicatorDisplayProps {
  typingUsers: TypingUser[];
}

export function TypingIndicatorDisplay({ typingUsers }: TypingIndicatorDisplayProps) {
  if (typingUsers.length === 0) return null;

  const text = (() => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].display_name} is typing`;
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0].display_name} and ${typingUsers[1].display_name} are typing`;
    }
    return 'Several people are typing';
  })();

  return (
    <div className="flex-shrink-0 px-4 py-1 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>{text}</span>
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}

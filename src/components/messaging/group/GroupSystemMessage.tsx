/**
 * GroupSystemMessage - Centered system text for join/leave events
 */

import React from 'react';

interface GroupSystemMessageProps {
  content: string;
}

export function GroupSystemMessage({ content }: GroupSystemMessageProps) {
  return (
    <div className="flex justify-center py-1.5 px-4">
      <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
        {content}
      </span>
    </div>
  );
}

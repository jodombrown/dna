// src/components/hubs/shared/ComingSoonList.tsx
// Coming soon feature list component

import React from 'react';

interface ComingSoonListProps {
  items: string[];
  title?: string;
}

export function ComingSoonList({ items, title = 'Coming Soon' }: ComingSoonListProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="h-px flex-1 bg-border" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <div className="h-px flex-1 bg-border" />
      </div>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-muted-foreground"
          >
            <span
              className="w-2 h-2 rounded-full bg-dna-emerald/40 mt-2 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-base">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComingSoonList;

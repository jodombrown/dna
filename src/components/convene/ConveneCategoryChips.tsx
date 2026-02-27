/**
 * DNA | CONVENE — Category Chips
 * Horizontally scrollable pill-shaped category filters.
 */

import React from 'react';
import {
  Mic, Lightbulb, Users, MapPin, Video, Palette, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: null },
  { id: 'conference', name: 'Conferences', icon: Mic },
  { id: 'workshop', name: 'Workshops', icon: Lightbulb },
  { id: 'networking', name: 'Networking', icon: Users },
  { id: 'meetup', name: 'Meetups', icon: MapPin },
  { id: 'webinar', name: 'Virtual', icon: Video },
  { id: 'social', name: 'Cultural', icon: Palette },
  { id: 'other', name: 'Business', icon: Briefcase },
] as const;

interface ConveneCategoryChipsProps {
  activeCategory: string;
  onSelect: (categoryId: string) => void;
  counts?: Record<string, number>;
}

export function ConveneCategoryChips({
  activeCategory,
  onSelect,
  counts = {},
}: ConveneCategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const count = cat.id === 'all'
          ? Object.values(counts).reduce((sum, c) => sum + c, 0)
          : counts[cat.id] || 0;
        const Icon = cat.icon;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0',
              'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-[hsl(var(--module-convene))] text-white border-[hsl(var(--module-convene))] shadow-sm'
                : 'bg-background text-foreground border-border hover:border-[hsl(var(--module-convene)/0.4)] hover:bg-[hsl(var(--module-convene)/0.06)]',
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {cat.name}
            {count > 0 && (
              <span
                className={cn(
                  'text-[10px] font-semibold ml-0.5',
                  isActive ? 'text-white/70' : 'text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

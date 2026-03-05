/**
 * Mobile Feed Tabs with Active Label Display
 * 
 * Shows icon + text for the active tab, icons-only for inactive tabs.
 * This provides clear context for what's selected while staying compact.
 */

import React from 'react';
import { Newspaper, Sparkles, Users, PenSquare, Bookmark } from 'lucide-react';
import { FeedTab } from '@/types/feed';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/haptics';

interface MobileFeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const TAB_CONFIG: { value: FeedTab; icon: React.ElementType; label: string }[] = [
  { value: 'all', icon: Newspaper, label: 'All' },
  { value: 'for_you', icon: Sparkles, label: 'For You' },
  { value: 'network', icon: Users, label: 'My Network' },
  { value: 'my_posts', icon: PenSquare, label: 'Mine' },
  { value: 'bookmarks', icon: Bookmark, label: 'Saved' },
];

export function MobileFeedTabs({ activeTab, onTabChange }: MobileFeedTabsProps) {
  return (
    <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg">
      {TAB_CONFIG.map(({ value, icon: Icon, label }) => {
        const isActive = activeTab === value;
        
        return (
          <button
            key={value}
            onClick={() => { haptic('light'); onTabChange(value); }}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive 
                ? "bg-background shadow-sm flex-1 px-3" 
                : "px-3 text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
            {isActive && (
              <span className="text-xs font-medium truncate">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
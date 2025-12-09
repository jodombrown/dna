/**
 * Mobile Feed Tabs with Touch-Friendly Labels
 * 
 * Shows icon-only tabs with animated label that appears briefly on tap
 * to help users understand what each tab represents.
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Sparkles, Users, PenSquare, Bookmark } from 'lucide-react';
import { FeedTab } from '@/types/feed';
import { cn } from '@/lib/utils';

interface MobileFeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

const TAB_CONFIG: { value: FeedTab; icon: React.ElementType; label: string; description: string }[] = [
  { value: 'all', icon: Newspaper, label: 'All', description: 'All posts' },
  { value: 'for_you', icon: Sparkles, label: 'For You', description: 'Personalized' },
  { value: 'network', icon: Users, label: 'Network', description: 'Connections' },
  { value: 'my_posts', icon: PenSquare, label: 'Mine', description: 'Your posts' },
  { value: 'bookmarks', icon: Bookmark, label: 'Saved', description: 'Bookmarked' },
];

export function MobileFeedTabs({ activeTab, onTabChange }: MobileFeedTabsProps) {
  const [showLabel, setShowLabel] = useState<FeedTab | null>(null);

  // Auto-hide label after delay
  useEffect(() => {
    if (showLabel) {
      const timer = setTimeout(() => setShowLabel(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [showLabel]);

  const handleTabClick = (tab: FeedTab) => {
    if (tab !== activeTab) {
      setShowLabel(tab);
    }
    onTabChange(tab);
  };

  return (
    <div className="relative">
      <Tabs value={activeTab} onValueChange={(v) => handleTabClick(v as FeedTab)}>
        <TabsList className="w-full grid grid-cols-5 h-10 bg-muted/50">
          {TAB_CONFIG.map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="relative text-xs px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Animated Label Tooltip */}
      {showLabel && (
        <div 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -bottom-8 z-50",
            "bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-full",
            "animate-fade-in shadow-lg",
            "pointer-events-none"
          )}
        >
          {TAB_CONFIG.find(t => t.value === showLabel)?.description}
        </div>
      )}
    </div>
  );
}
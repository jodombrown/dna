import React from 'react';
import { Users, Network, MessageCircle, Search, SlidersHorizontal } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type ConnectTab = 'discover' | 'network' | 'messages';

interface ConnectMobileHeaderProps {
  activeTab: ConnectTab;
  onTabChange: (tab: ConnectTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFiltersClick: () => void;
  activeFilterCount?: number;
}

const tabs = [
  { id: 'discover' as const, label: 'Members', icon: Users },
  { id: 'network' as const, label: 'Network', icon: Network },
  { id: 'messages' as const, label: 'Messages', icon: MessageCircle },
];

export function ConnectMobileHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onFiltersClick,
  activeFilterCount = 0,
}: ConnectMobileHeaderProps) {
  const { isScrolled } = useScrollPosition(50);

  return (
    <div className="md:hidden">
      {/* Default Header - Hidden when scrolled */}
      <div
        className={cn(
          'transition-all duration-200 ease-out bg-background',
          isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'
        )}
      >
        {/* Tab Bar with Icon + Text */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors',
                  isActive
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Row */}
        <div className="flex items-center gap-2 p-3 bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 bg-background border-border"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onFiltersClick}
            className="h-10 px-3 border-border relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Sticky Header - Shown when scrolled */}
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm transition-all duration-200 ease-out',
          isScrolled
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Compact Tab Pills */}
          <div className="flex gap-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compact Search */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/50 border-border"
            />
          </div>

          {/* Compact Filter Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onFiltersClick}
            className="h-8 w-8 p-0 relative shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Spacer for sticky header */}
      <div
        className={cn(
          'transition-all duration-200',
          isScrolled ? 'h-14' : 'h-0'
        )}
      />
    </div>
  );
}

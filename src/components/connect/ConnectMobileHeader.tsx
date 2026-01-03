import React from 'react';
import { Users, Network, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';

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
  const navigate = useNavigate();
  const { isScrolled } = useScrollPosition(50);
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { open: openAccountDrawer } = useAccountDrawer();

  return (
    <div className="md:hidden">
      {/* Default Header - Hidden when scrolled */}
      <div
        className={cn(
          'transition-all duration-200 ease-out bg-background',
          isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'
        )}
      >
        {/* Top Row: DNA Logo + Search + Notification + Avatar (Feed-style) */}
        <div className="flex items-center justify-between h-14 px-3 gap-2 border-b border-border">
          {/* DNA Logo */}
          <img 
            src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
            alt="DNA" 
            className="h-8 w-auto cursor-pointer flex-shrink-0"
            width={57}
            height={32}
            onClick={() => navigate('/dna/feed')}
          />

          {/* Search Input styled like composer bubble */}
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 rounded-full bg-muted border-0 pl-4 pr-10 text-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onFiltersClick}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Right: Notification + Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <NotificationBell />
            {user && profile && (
              <Avatar 
                className="h-8 w-8 cursor-pointer" 
                onClick={openAccountDrawer}
              >
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Tab Bar: Horizontal pills like Feed filter row */}
        <div className="flex items-center gap-1 px-3 py-2 bg-muted/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? 'bg-background shadow-sm text-foreground border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 text-sm bg-muted/50 border-border rounded-full pl-3 pr-8"
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

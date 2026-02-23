import React from 'react';
import { Users, Network, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import dnaLogo from '@/assets/dna-logo.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';
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

const TAB_CONFIG = [
  { value: 'discover' as const, icon: Users, label: 'Members' },
  { value: 'network' as const, icon: Network, label: 'Network' },
  { value: 'messages' as const, icon: MessageCircle, label: 'Messages' },
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
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { open: openAccountDrawer } = useAccountDrawer();

  return (
    <div className="md:hidden">
      {/* Header Row: DNA Logo + Search (with filter) + Notification + Avatar */}
      <div className="flex items-center h-14 px-3 gap-2 bg-background border-b-0">
        {/* DNA Logo */}
        <img 
          src={dnaLogo}
          alt="DNA" 
          className="h-[60px] w-auto cursor-pointer flex-shrink-0"
          width={57}
          height={32}
          onClick={() => navigate('/dna/feed')}
        />

        {/* Search Input with integrated filter button */}
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
          <UnifiedNotificationBell />
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

      {/* Tab Bar - Matches Feed tab styling (no sticky needed, parent is fixed) */}
      <div className="px-3 py-1.5 bg-background border-b border-border">
        <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg">
          {TAB_CONFIG.map(({ value, icon: Icon, label }) => {
            const isActive = activeTab === value;
            
            return (
              <button
                key={value}
                onClick={() => onTabChange(value)}
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
      </div>
    </div>
  );
}

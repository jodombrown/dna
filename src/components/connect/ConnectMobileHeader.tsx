import React from 'react';
import { Users, Network, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { open: openAccountDrawer } = useAccountDrawer();

  return (
    <div className="md:hidden">
      {/* Single Header Row: DNA Logo + Search (with filter) + Notification + Avatar */}
      <div className="flex items-center h-14 px-3 gap-2 bg-background border-b border-border">
        {/* DNA Logo */}
        <img 
          src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
          alt="DNA" 
          className="h-8 w-auto cursor-pointer flex-shrink-0"
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

      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-40 flex items-center gap-1 px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
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
                  ? 'bg-muted text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

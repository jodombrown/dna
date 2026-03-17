/**
 * DNA | CONVENE — Mobile Header
 * Two-row fixed header matching Feed & Connect patterns.
 * Row 1: DNA logo | Composer bubble | Notification bell | Profile avatar
 * Row 2: Pill filter bar with copper accent
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import dnaLogo from '@/assets/dna-logo.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';

const PILLS = [
  { id: 'all', label: 'All' },
  { id: 'near_me', label: 'Near Me' },
  { id: 'this_week', label: 'This Week' },
  { id: 'online', label: 'Online' },
  { id: 'free', label: 'Free' },
  { id: 'network', label: 'My Network' },
] as const;

interface ConveneMobileHeaderProps {
  activePill: string;
  onPillChange: (pill: string) => void;
  onComposerClick: () => void;
  isRow1Visible?: boolean;
}

export function ConveneMobileHeader({
  activePill,
  onPillChange,
  onComposerClick,
  isRow1Visible = true,
}: ConveneMobileHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { open: openAccountDrawer } = useAccountDrawer();

  return (
    <div className="md:hidden bg-background">
      {/* Row 1: Logo | Composer bubble | Bell | Avatar */}
      <div
        className={cn(
          'flex items-center h-14 px-1 gap-1.5 transition-all duration-200 overflow-hidden',
          isRow1Visible ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        {/* DNA Logo */}
        <img
          src={dnaLogo}
          alt="DNA"
          className="h-[80px] w-auto cursor-pointer flex-shrink-0 -ml-4"
          width={57}
          height={32}
          onClick={() => navigate('/dna/feed')}
        />

        {/* Composer Bubble */}
        <div
          onClick={onComposerClick}
          className="flex-1 min-w-0 bg-muted rounded-full px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
        >
          <span className="truncate block">Host or find an event...</span>
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-1.5 flex-shrink-0 pr-1">
          <UnifiedNotificationBell />
          {user && profile && (
            <Avatar
              className="h-9 w-9 cursor-pointer"
              onClick={openAccountDrawer}
            >
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {profile.display_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Row 2: Pill Filter Bar — always visible */}
      <div className="px-3 py-1.5 bg-background border-b border-border">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {PILLS.map((pill) => {
            const isActive = activePill === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => onPillChange(pill.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
                  'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-dna-copper text-white border-dna-copper shadow-sm'
                    : 'bg-background text-foreground border-border hover:border-dna-copper/40 hover:bg-dna-copper/5',
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

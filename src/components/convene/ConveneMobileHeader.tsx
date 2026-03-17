/**
 * DNA | CONVENE — Mobile Header
 * Two-row fixed header matching Feed & Connect patterns.
 * Row 1: DNA logo | Composer bubble | Notification bell | Profile avatar
 * Row 2: Segmented icon+label tab bar (matching Feed & Connect)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, Globe, Ticket, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import dnaLogo from '@/assets/dna-logo.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';
import { haptic } from '@/utils/haptics';

const TABS = [
  { id: 'all', icon: CalendarDays, label: 'All' },
  { id: 'near_me', icon: MapPin, label: 'Near Me' },
  { id: 'this_week', icon: Clock, label: 'This Week' },
  { id: 'online', icon: Globe, label: 'Online' },
  { id: 'free', icon: Ticket, label: 'Free' },
  { id: 'network', icon: Users, label: 'Network' },
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
        <img
          src={dnaLogo}
          alt="DNA"
          className="h-[80px] w-auto cursor-pointer flex-shrink-0 -ml-4"
          width={57}
          height={32}
          onClick={() => navigate('/dna/feed')}
        />

        <div
          onClick={onComposerClick}
          className="flex-1 min-w-0 bg-muted rounded-full px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
        >
          <span className="truncate block">Host or find an event...</span>
        </div>

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

      {/* Row 2: Segmented Tab Bar — matches Feed & Connect */}
      <div className="px-3 py-1.5 bg-background border-b border-border">
        <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg">
          {TABS.map(({ id, icon: Icon, label }) => {
            const isActive = activePill === id;
            return (
              <button
                key={id}
                onClick={() => { haptic('light'); onPillChange(id); }}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-background shadow-sm flex-1 px-3'
                    : 'px-3 text-muted-foreground hover:text-foreground hover:bg-background/50',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')} />
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
import React from 'react';
import { Search, Bell, PenSquare } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';

// DNA Logo component
const DNALogo = ({ size = 28 }: { size?: number }) => (
  <svg width={size * 2.5} height={size} viewBox="0 0 100 40" className="text-current">
    <text x="0" y="30" fontSize="32" fontWeight="bold" fill="currentColor">
      <tspan fill="#D97706">D</tspan>
      <tspan fill="#4A8D77">N</tspan>
      <tspan fill="#B87333">A</tspan>
    </text>
  </svg>
);

interface MobileFeedHeaderProps {
  onComposerOpen?: () => void;
  onSearchOpen?: () => void;
}

export function MobileFeedHeader({ onComposerOpen, onSearchOpen }: MobileFeedHeaderProps) {
  const { isScrolled } = useScrollPosition(50);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { open } = useAccountDrawer();

  const handleProfileClick = () => {
    open();
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleLogoClick = () => {
    navigate('/feed');
  };

  return (
    <>
      {/* Default Header - Visible when not scrolled */}
      <header
        className={cn(
          'md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border',
          'transition-all duration-200 ease-out',
          isScrolled ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2 h-14">
          {/* DNA Logo */}
          <button onClick={handleLogoClick} className="flex-shrink-0">
            <DNALogo size={28} />
          </button>

          {/* Composer Prompt */}
          <button
            onClick={onComposerOpen}
            className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-full text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
          >
            <span>What's on your mind?</span>
          </button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 relative"
            onClick={handleNotificationsClick}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>

          {/* Profile Avatar */}
          <button onClick={handleProfileClick} className="flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Collapsed Header - Visible when scrolled */}
      <header
        className={cn(
          'md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm',
          'transition-all duration-200 ease-out',
          isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 h-12">
          {/* DNA Logo - smaller */}
          <button onClick={handleLogoClick} className="flex-shrink-0">
            <DNALogo size={24} />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onSearchOpen}
          >
            <Search className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
            onClick={handleNotificationsClick}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Profile Avatar - smaller */}
          <button onClick={handleProfileClick} className="flex-shrink-0">
            <Avatar className="h-7 w-7">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="md:hidden h-14" />

      {/* Compose FAB - Visible when scrolled */}
      <button
        onClick={onComposerOpen}
        className={cn(
          'md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'hover:bg-primary/90 active:scale-95',
          isScrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        )}
      >
        <PenSquare className="w-6 h-6" />
      </button>
    </>
  );
}

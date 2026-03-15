import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, PenSquare } from 'lucide-react';
import dnaLogo from '@/assets/dna-logo.png';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedNotificationBell } from '@/components/notifications/UnifiedNotificationBell';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
  onComposerClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'feed';
}

/**
 * Mobile Header Component
 * Adaptive header for mobile views with context-aware navigation
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  showSearch = false,
  onSearchClick,
  onComposerClick,
  actions,
  className,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { open: openAccountDrawer } = useAccountDrawer();

  // Auto-detect if we should show back button based on route depth
  const shouldShowBack = showBack || (
    location.pathname.split('/').filter(Boolean).length > 2 &&
    !location.pathname.endsWith('/feed')
  );

  // Feed variant: compact header with DNA logo, composer, bell, profile
  if (variant === 'feed' && user && profile) {
    return (
      <header 
        className={cn(
          "sticky top-0 z-40 bg-background border-b border-border",
          className
        )}
      >
        <div className="flex items-center justify-between h-14 px-3 gap-2">
          {/* DNA Logo */}
          <img 
            src={dnaLogo}
            alt="DNA" 
            className="h-[80px] w-auto cursor-pointer flex-shrink-0"
            width={57}
            height={32}
            onClick={() => navigate('/dna/feed')}
          />

          {/* Composer Bubble - "What's on your mind?" */}
          {onComposerClick && (
            <div 
              onClick={onComposerClick}
              className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
            >
              <span className="truncate">What's on your mind?</span>
            </div>
          )}

      {/* Right: Notification + Profile */}
       <div className="flex items-center gap-2 flex-shrink-0">
         <UnifiedNotificationBell />
         <Avatar 
           className="h-8 w-8 cursor-pointer" 
           onClick={openAccountDrawer}
         >
           <AvatarImage src={profile.avatar_url || ''} />
           <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
         </Avatar>
       </div>
        </div>
      </header>
    );
  }

  // Default variant: existing header layout
  return (
    <header 
      className={cn(
        "sticky top-0 z-40 bg-background border-b border-border",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back or Logo */}
        <div className="flex items-center gap-2">
          {shouldShowBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="px-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <img 
              src={dnaLogo}
              alt="DNA" 
              className="h-[90px] w-auto cursor-pointer"
              width={57}
              height={32}
              onClick={() => navigate('/dna/feed')}
            />
          )}
        </div>

        {/* Center: Title */}
        {title && (
          <h1 className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-lg truncate max-w-[50%]">
            {title}
          </h1>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="px-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
};

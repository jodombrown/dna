import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

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
        <div className="flex items-center justify-between h-14 px-4">
          {/* DNA Logo */}
          <img 
            src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
            alt="DNA" 
            className="h-8 w-auto cursor-pointer"
            onClick={() => navigate('/dna/feed')}
          />

          {/* Right: Composer + Notification + Profile */}
          <div className="flex items-center gap-3">
            {onComposerClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onComposerClick}
                className="h-9 w-9"
              >
                <PenSquare className="w-5 h-5" />
              </Button>
            )}
            <NotificationBell />
            <Avatar 
              className="h-8 w-8 cursor-pointer" 
              onClick={() => navigate('/dna/profile')}
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
              src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
              alt="DNA" 
              className="h-8 w-auto cursor-pointer"
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

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, PenSquare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { useMessage } from '@/contexts/MessageContext';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
  showCompose?: boolean;
  showMessages?: boolean;
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
  actions,
  className,
  showCompose = false,
  showMessages = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const composer = useUniversalComposer();
  const { openMessageOverlay } = useMessage();

  // Auto-detect if we should show back button based on route depth
  const shouldShowBack = showBack || (
    location.pathname.split('/').filter(Boolean).length > 2 &&
    !location.pathname.endsWith('/feed')
  );

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
        <div className="flex items-center gap-1">
          {showCompose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => composer.open('post')}
              className="px-2"
            >
              <PenSquare className="w-5 h-5" />
            </Button>
          )}
          {showMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openMessageOverlay('')}
              className="px-2"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          )}
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

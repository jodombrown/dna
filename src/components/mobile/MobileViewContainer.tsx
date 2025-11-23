import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { MobileHeader } from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

interface MobileViewContainerProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
  headerActions?: React.ReactNode;
  fullHeight?: boolean;
  noPadding?: boolean;
  className?: string;
  showCompose?: boolean;
  showMessages?: boolean;
}

/**
 * Mobile View Container
 * Standardized container for all mobile views with consistent header and navigation
 */
export const MobileViewContainer: React.FC<MobileViewContainerProps> = ({
  children,
  title,
  showBack,
  showSearch,
  onSearchClick,
  headerActions,
  fullHeight = false,
  noPadding = false,
  className,
  showCompose = false,
  showMessages = false,
}) => {
  const { isMobile } = useMobile();

  // If not mobile, just render children
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title={title}
        showBack={showBack}
        showSearch={showSearch}
        onSearchClick={onSearchClick}
        actions={headerActions}
        showCompose={showCompose}
        showMessages={showMessages}
      />
      
      <main 
        className={cn(
          "pb-16 sm:pb-20", // Space for bottom nav
          fullHeight && "min-h-[calc(100vh-3.5rem-4rem)]", // Full height minus header and nav
          !noPadding && "px-3 sm:px-4 py-3 sm:py-4",
          className
        )}
      >
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
};

import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { MobileHeader } from './MobileHeader';
// Dead code today — MobileFeedView, its only consumer, has zero consumers
// of its own. This used to render its own <MobileBottomNav /> unconditionally;
// every real mobile layout it would be mounted inside already renders one,
// so reactivating it without removing this would double up the bottom nav.
// Removed; let the surrounding layout own the bottom nav.

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
  className
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
      />
      
      <main
        className={cn(
          "pb-bottom-nav", // Space for bottom nav
          !noPadding && "px-3 sm:px-4 py-3 sm:py-4",
          className
        )}
        // Full height minus chrome and the bottom nav, both read from tokens.
        style={
          fullHeight
            ? {
                minHeight:
                  'calc(100dvh - var(--total-header-height, 7.5rem) - var(--bottom-nav-height, 4rem))',
              }
            : undefined
        }
      >
        {children}
      </main>
    </div>
  );
};

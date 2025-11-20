import React from 'react';
import { useViewState } from '@/contexts/ViewStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import UnifiedHeader from '@/components/UnifiedHeader';

interface BaseLayoutProps {
  children: React.ReactNode;
}

/**
 * BaseLayout - The intelligent layout wrapper that adapts based on view state
 * 
 * This component automatically applies the correct layout configuration
 * based on the current view state (determined by the route).
 * 
 * Features:
 * - Smooth transitions between layout configurations (300ms)
 * - Responsive behavior for mobile/tablet/desktop
 * - Preserves context across view state changes
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const { viewState, layoutConfig } = useViewState();
  const { user } = useAuth();

  // For now, we render children directly
  // In Phase 2, this will intelligently distribute content to columns
  // based on the layout configuration
  
  return (
    <>
      <UnifiedHeader />
      <div 
        className={cn(
          "min-h-screen w-full max-w-full",
          user 
            ? "bg-gradient-to-br from-dna-mint/20 via-background to-dna-copper/10" 
            : "bg-background",
          "pt-14 sm:pt-16",
          "transition-all duration-300 ease-in-out",
          "overflow-x-hidden"
        )}
        data-view-state={viewState}
        data-layout-type={layoutConfig.type}
      >
        {children}
      </div>
    </>
  );
};

export default BaseLayout;

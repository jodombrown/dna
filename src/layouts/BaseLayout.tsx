import React from 'react';
import { useViewState } from '@/contexts/ViewStateContext';
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

  // For now, we render children directly
  // In Phase 2, this will intelligently distribute content to columns
  // based on the layout configuration
  
  return (
    <>
      <UnifiedHeader />
      <div 
        className={cn(
          "min-h-screen w-full max-w-full bg-background",
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

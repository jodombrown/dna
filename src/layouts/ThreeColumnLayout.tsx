import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface ThreeColumnLayoutProps {
  leftWidth?: string;
  centerWidth?: string;
  rightWidth?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

/**
 * ThreeColumnLayout - Adaptive 3-column grid layout
 * 
 * Desktop: Displays all three columns side-by-side
 * Tablet: Stacks columns vertically
 * Mobile: Single column stack
 * 
 * Default widths: 15% - 70% - 15%
 */
const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftWidth = '15%',
  centerWidth = '70%',
  rightWidth = '15%',
  left,
  center,
  right,
  className,
}) => {
  const { isMobile, isTablet } = useMobile();

  // On mobile/tablet, stack columns vertically
  if (isMobile || isTablet) {
    return (
      <div className={cn("flex flex-col w-full gap-4 p-4", className)}>
        {left && (
          <div className="w-full transition-all duration-300 ease-in-out">
            {left}
          </div>
        )}
        {center && (
          <div className="w-full transition-all duration-300 ease-in-out">
            {center}
          </div>
        )}
        {right && (
          <div className="w-full transition-all duration-300 ease-in-out">
            {right}
          </div>
        )}
      </div>
    );
  }

  // Desktop: 3-column grid with independent scrolling
  return (
    <div className={cn("flex w-full gap-4 p-4", className)} style={{ height: 'calc(100vh - 64px)' }}>
      {left && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-auto h-full"
          style={{ 
            width: leftWidth,
            minWidth: 0, // Allow shrinking below content width
          }}
        >
          <div className="px-4 py-8">
            {left}
          </div>
        </aside>
      )}
      
      {center && (
        <main 
          className="transition-all duration-300 ease-in-out overflow-auto flex-1 h-full"
          style={{ 
            width: centerWidth,
            minWidth: 0, // Allow shrinking below content width
          }}
        >
          <div className="px-6 py-8">
            {center}
          </div>
        </main>
      )}
      
      {right && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-auto h-full"
          style={{ 
            width: rightWidth,
            minWidth: 0, // Allow shrinking below content width
          }}
        >
          <div className="px-4 py-8">
            {right}
          </div>
        </aside>
      )}
    </div>
  );
};

export default ThreeColumnLayout;

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
      <div className={cn("flex flex-col w-full gap-4 p-4", className)} style={{ paddingTop: 'var(--header-h, 96px)' }}>
        {left && (
          <div 
            className="w-full transition-all duration-300 ease-in-out overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - var(--header-h, 96px) - 2rem)' }}
          >
            {left}
          </div>
        )}
        {center && (
          <div 
            className="w-full transition-all duration-300 ease-in-out overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - var(--header-h, 96px) - 2rem)' }}
          >
            {center}
          </div>
        )}
        {right && (
          <div 
            className="w-full transition-all duration-300 ease-in-out overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - var(--header-h, 96px) - 2rem)' }}
          >
            {right}
          </div>
        )}
      </div>
    );
  }

  // Desktop: 3-column grid with independent scrolling
  return (
    <div className={cn("flex w-full gap-6 px-4 py-6", className)} style={{ paddingTop: 'calc(var(--header-h, 96px) + 1.5rem)' }}>
      {left && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ 
            width: leftWidth,
            maxWidth: leftWidth,
            minWidth: leftWidth,
            maxHeight: 'calc(100vh - var(--header-h, 96px) - 3rem)',
          }}
        >
          {left}
        </aside>
      )}
      
      {center && (
        <main 
          className="transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ 
            width: centerWidth,
            maxWidth: centerWidth,
            minWidth: centerWidth,
            maxHeight: 'calc(100vh - var(--header-h, 96px) - 3rem)',
          }}
        >
          {center}
        </main>
      )}
      
      {right && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ 
            width: rightWidth,
            maxWidth: rightWidth,
            minWidth: rightWidth,
            maxHeight: 'calc(100vh - var(--header-h, 96px) - 3rem)',
          }}
        >
          {right}
        </aside>
      )}
    </div>
  );
};

export default ThreeColumnLayout;

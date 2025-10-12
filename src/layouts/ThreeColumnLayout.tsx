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

  // Desktop: 3-column grid
  return (
    <div className={cn("flex w-full h-full gap-4 p-4", className)}>
      {left && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ width: leftWidth }}
        >
          {left}
        </aside>
      )}
      
      {center && (
        <main 
          className="transition-all duration-300 ease-in-out overflow-y-auto flex-1"
          style={{ width: centerWidth }}
        >
          {center}
        </main>
      )}
      
      {right && (
        <aside 
          className="transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ width: rightWidth }}
        >
          {right}
        </aside>
      )}
    </div>
  );
};

export default ThreeColumnLayout;

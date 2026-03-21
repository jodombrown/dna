import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface TwoColumnLayoutProps {
  leftWidth?: string;
  rightWidth?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  stackOnMobile?: boolean; // Option to stack vertically on mobile
}

/**
 * TwoColumnLayout - Adaptive 2-column grid layout
 * 
 * Desktop: Displays two columns side-by-side
 * Mobile/Tablet: Stacks columns vertically by default
 * 
 * Default widths: 60% - 40%
 * Common use cases:
 * - CONVENE MODE: Events list (60%) + Event detail (40%)
 * - MESSAGES MODE: Conversation list (35%) + Active chat (65%)
 * - CONTRIBUTE MODE: Opportunities (55%) + Detail panel (45%)
 */
const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  leftWidth = '60%',
  rightWidth = '40%',
  left,
  right,
  className,
  stackOnMobile = true,
}) => {
  const { isMobile, isTablet } = useMobile();

  // On mobile/tablet, stack columns vertically (unless disabled)
  if ((isMobile || isTablet) && stackOnMobile) {
    return (
      <div className={cn("flex flex-col w-full gap-4 p-4", className)}>
        {left && (
          <div className="w-full">
            {left}
          </div>
        )}
        {right && (
          <div className="w-full">
            {right}
          </div>
        )}
      </div>
    );
  }

  // Desktop: 2-column grid with independent scrolling
  return (
    <div className={cn("flex w-full gap-4 p-4", className)} style={{ height: 'calc(100dvh - 64px)' }}>
      {left && (
        <main 
          id="main-content"
          tabIndex={-1}
          className="overflow-hidden h-full focus:outline-none"
          style={{ 
            width: leftWidth,
            minWidth: 0,
          }}
        >
          {left}
        </main>
      )}
      
      {right && (
        <div 
          className="overflow-hidden flex-1 h-full"
          style={{ 
            width: rightWidth,
            minWidth: 0,
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
};

export default TwoColumnLayout;

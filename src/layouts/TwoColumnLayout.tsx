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
          <div className="w-full transition-all duration-300 ease-in-out">
            {left}
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

  // Desktop: 2-column grid
  return (
    <div className={cn("flex w-full h-full gap-4 p-4", className)}>
      {left && (
        <div 
          className="transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ width: leftWidth }}
        >
          {left}
        </div>
      )}
      
      {right && (
        <div 
          className="transition-all duration-300 ease-in-out overflow-y-auto flex-1"
          style={{ width: rightWidth }}
        >
          {right}
        </div>
      )}
    </div>
  );
};

export default TwoColumnLayout;

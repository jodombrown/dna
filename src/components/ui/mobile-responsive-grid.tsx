import React from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const MobileResponsiveGrid: React.FC<MobileResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-10'
  };

  const getGridCols = () => {
    const mobileClass = `grid-cols-${cols.mobile || 1}`;
    const tabletClass = `sm:grid-cols-${cols.tablet || 2}`;
    const desktopClass = `lg:grid-cols-${cols.desktop || 3}`;
    return `${mobileClass} ${tabletClass} ${desktopClass}`;
  };

  return (
    <div className={cn(
      'grid',
      getGridCols(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default MobileResponsiveGrid;
import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className,
}) => {
  const { isMobile, isTablet, isDesktop } = useMobile();

  const getGridCols = () => {
    const colClass = (n?: number, prefix = '') => {
      switch (n) {
        case 1: return `${prefix}grid-cols-1`;
        case 2: return `${prefix}grid-cols-2`;
        case 3: return `${prefix}grid-cols-3`;
        case 4: return `${prefix}grid-cols-4`;
        default: return `${prefix}grid-cols-1`;
      }
    };
    const classes = [
      colClass(cols.mobile),
      colClass(cols.tablet, 'md:'),
      colClass(cols.desktop, 'lg:')
    ].join(' ');
    return classes || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  const getGapClass = () => {
    const gapMap = {
      none: 'gap-0',
      sm: 'gap-2 md:gap-3',
      md: 'gap-3 md:gap-4',
      lg: 'gap-4 md:gap-6',
    };
    return gapMap[gap];
  };

  return (
    <div 
      className={cn(
        'grid w-full',
        getGridCols(),
        getGapClass(),
        className
      )}
    >
      {children}
    </div>
  );
};

export default MobileGrid;
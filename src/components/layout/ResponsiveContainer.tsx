import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'wide' | 'narrow';
  forceColumn?: boolean;
  className?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  variant = 'default',
  forceColumn = true,
  className
}) => {
  const { isMobile, isTablet } = useMobile();
  
  // Under 768px (mobile + small tablets), always force single column
  const shouldForceColumn = forceColumn && (isMobile || window.innerWidth < 768);
  
  const getContainerClasses = () => {
    if (shouldForceColumn) {
      return 'flex flex-col w-full space-y-4';
    }
    
    switch (variant) {
      case 'wide':
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
      case 'narrow':
        return 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';
      case 'default':
      default:
        return 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div 
      className={cn(
        'w-full',
        getContainerClasses(),
        // Prevent horizontal scroll
        shouldForceColumn && 'overflow-x-hidden',
        className
      )}
      data-responsive-container
      data-force-column={shouldForceColumn}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
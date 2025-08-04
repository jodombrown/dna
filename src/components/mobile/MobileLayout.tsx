import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  variant?: 'full' | 'padded' | 'card';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  variant = 'padded',
  spacing = 'md',
  className,
}) => {
  const { isMobile, isTablet, deviceType } = useMobile();

  const getVariantClasses = () => {
    switch (variant) {
      case 'full':
        return 'w-full h-full';
      case 'card':
        return isMobile 
          ? 'mx-2 my-1 bg-white rounded-lg shadow-sm border' 
          : 'mx-4 my-2 bg-white rounded-xl shadow-md border';
      case 'padded':
      default:
        return isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8';
    }
  };

  const getSpacingClasses = () => {
    if (spacing === 'none') return '';
    
    const spacingMap = {
      sm: isMobile ? 'py-2' : 'py-3',
      md: isMobile ? 'py-4' : 'py-6',
      lg: isMobile ? 'py-6' : 'py-8',
    };
    
    return spacingMap[spacing];
  };

  return (
    <div 
      className={cn(
        'w-full',
        getVariantClasses(),
        getSpacingClasses(),
        // Touch-friendly classes for mobile
        isMobile && 'touch-manipulation',
        className
      )}
      data-device={deviceType}
    >
      {children}
    </div>
  );
};

export default MobileLayout;
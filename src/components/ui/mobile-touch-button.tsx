import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileTouchButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  fullWidth?: boolean;
}

const MobileTouchButton: React.FC<MobileTouchButtonProps> = ({
  children,
  className,
  touchOptimized = true,
  fullWidth = false,
  size = 'default',
  ...props
}) => {
  return (
    <Button
      {...props}
      size={size}
      className={cn(
        // Base mobile-friendly sizing
        'min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 py-2 sm:py-3',
        'text-base sm:text-lg font-medium',
        
        // Touch optimization
        touchOptimized && [
          'touch-manipulation',
          'active:scale-95 active:duration-75',
          'transition-all duration-200 ease-out'
        ],
        
        // Full width on mobile
        fullWidth && 'w-full',
        
        // Custom sizing overrides
        size === 'sm' && 'min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base',
        size === 'lg' && 'min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl',
        
        className
      )}
    >
      {children}
    </Button>
  );
};

export default MobileTouchButton;
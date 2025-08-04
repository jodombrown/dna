import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileButtonProps extends ButtonProps {
  fullWidth?: boolean;
  touchOptimized?: boolean;
}

const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  className,
  fullWidth,
  touchOptimized = true,
  size,
  ...props
}) => {
  const { isMobile, isTouch } = useMobile();

  // Auto-adjust size for mobile
  const getSize = () => {
    if (size) return size;
    return isMobile ? 'default' : 'default';
  };

  const getTouchClasses = () => {
    if (!touchOptimized || !isTouch) return '';
    
    return cn(
      // Minimum touch target size
      'min-h-[48px] min-w-[48px]',
      // Touch feedback
      'active:scale-95 transition-transform duration-100',
      // Better spacing for touch
      isMobile && 'px-6 py-3'
    );
  };

  return (
    <Button
      size={getSize()}
      className={cn(
        fullWidth && 'w-full',
        getTouchClasses(),
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default MobileButton;
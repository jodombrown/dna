import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const MobileCard: React.FC<MobileCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  onClick,
}) => {
  const { isMobile, isTouch } = useMobile();

  const getVariantClasses = () => {
    const baseClasses = 'bg-card border border-border rounded-lg';
    
    switch (variant) {
      case 'elevated':
        return `${baseClasses} shadow-lg`;
      case 'flat':
        return `${baseClasses} shadow-none`;
      case 'interactive':
        return `${baseClasses} shadow-sm transition-all duration-200 ${
          isTouch ? 'active:scale-95' : 'hover:scale-[1.02]'
        } cursor-pointer hover:shadow-md`;
      case 'default':
      default:
        return `${baseClasses} shadow-sm`;
    }
  };

  const getPaddingClasses = () => {
    const paddingMap = {
      none: '',
      sm: isMobile ? 'p-3' : 'p-4',
      md: isMobile ? 'p-3 sm:p-4' : 'p-5',
      lg: isMobile ? 'p-4 sm:p-5' : 'p-6',
    };
    return paddingMap[padding];
  };

  return (
    <div
      className={cn(
        'w-full',
        getVariantClasses(),
        getPaddingClasses(),
        // Touch-friendly minimum height
        isMobile && isTouch && 'min-h-[48px]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default MobileCard;
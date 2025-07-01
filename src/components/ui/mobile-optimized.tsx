
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const MobileOptimizedContainer: React.FC<MobileOptimizedContainerProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      className,
      isMobile ? mobileClassName : desktopClassName
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: string;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-4",
  className
}) => {
  const gridCols = `grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`;
  
  return (
    <div className={cn("grid", gridCols, gap, className)}>
      {children}
    </div>
  );
};

interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 touch-manipulation";
  
  const sizeClasses = {
    sm: "px-4 py-3 text-sm min-h-[44px]", // 44px minimum for iOS
    md: "px-6 py-4 text-base min-h-[48px]",
    lg: "px-8 py-5 text-lg min-h-[52px]"
  };
  
  const variantClasses = {
    primary: "bg-dna-emerald hover:bg-dna-forest text-white active:scale-95",
    secondary: "bg-dna-copper hover:bg-dna-gold text-white active:scale-95",
    outline: "border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white active:scale-95"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};


import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const ResponsiveHeading: React.FC<ResponsiveHeadingProps> = ({
  children,
  level,
  className
}) => {
  const baseClasses = "font-bold leading-tight text-dna-forest";
  
  const responsiveClasses = {
    1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl",
    2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
    3: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
    4: "text-base sm:text-lg md:text-xl lg:text-2xl",
    5: "text-sm sm:text-base md:text-lg",
    6: "text-xs sm:text-sm md:text-base"
  };
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={cn(baseClasses, responsiveClasses[level], className)}>
      {children}
    </Tag>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'base',
  className
}) => {
  const sizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl"
  };
  
  return (
    <p className={cn("leading-relaxed text-gray-700", sizeClasses[size], className)}>
      {children}
    </p>
  );
};

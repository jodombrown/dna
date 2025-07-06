import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  touchOptimized?: boolean;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  title,
  children,
  className,
  padding = 'md',
  touchOptimized = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 lg:p-6',
    lg: 'p-4 sm:p-6 lg:p-8'
  };

  return (
    <Card 
      className={cn(
        'w-full rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
        touchOptimized && 'touch-manipulation cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all duration-150',
        className
      )}
    >
      {title && (
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(paddingClasses[padding])}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;
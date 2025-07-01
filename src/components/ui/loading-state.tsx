
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  showSpinner?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'md',
  message = 'Loading...',
  className,
  showSpinner = true
}) => {
  const sizeClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-16'
  };

  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      {showSpinner && (
        <Loader2 className={cn(
          'animate-spin text-dna-emerald mb-3',
          spinnerSizes[size]
        )} />
      )}
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

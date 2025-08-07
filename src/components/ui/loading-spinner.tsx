import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="text-center">
      <div 
        className={cn(
          'border-2 border-dna-copper border-t-transparent rounded-full animate-spin mx-auto mb-4',
          sizeClasses[size],
          className
        )}
      />
      <p className="text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
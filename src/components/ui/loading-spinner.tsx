import React from 'react';
import { cn } from '@/lib/utils';
import AfricaSpinner from './AfricaSpinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  showText = false
}) => {
  return (
    <AfricaSpinner size={size} className={className} showText={showText} />
  );
};

export default LoadingSpinner;
export { LoadingSpinner };
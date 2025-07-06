import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'white' | 'gray' | 'gradient';
  fullWidth?: boolean;
}

const MobileSectionWrapper: React.FC<MobileSectionWrapperProps> = ({
  children,
  className = '',
  padding = 'md',
  background = 'transparent',
  fullWidth = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'py-4 sm:py-6 px-4 sm:px-6',
    md: 'py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8',
    lg: 'py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8',
    xl: 'py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'
  };

  const backgroundClasses = {
    transparent: '',
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10'
  };

  return (
    <section className={cn(
      backgroundClasses[background],
      paddingClasses[padding],
      className
    )}>
      <div className={cn(
        !fullWidth && 'max-w-7xl mx-auto',
        fullWidth && 'w-full'
      )}>
        {children}
      </div>
    </section>
  );
};

export default MobileSectionWrapper;
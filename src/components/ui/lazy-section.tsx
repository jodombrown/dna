
import React, { lazy, Suspense } from 'react';
import { LoadingState } from './loading-state';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({ 
  children, 
  fallback = <LoadingState size="md" message="Loading content..." />,
  className = ""
}) => {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

// Create a higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <LazySection fallback={fallback}>
      <Component {...props} />
    </LazySection>
  );
};


import React from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityFocusProps {
  children: React.ReactNode;
  className?: string;
}

export const AccessibilityFocus: React.FC<AccessibilityFocusProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "focus-within:ring-2 focus-within:ring-dna-emerald focus-within:ring-offset-2 rounded-md transition-all",
        className
      )}
    >
      {children}
    </div>
  );
};

export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-dna-emerald text-white px-4 py-2 rounded-md z-50 font-medium"
    >
      Skip to main content
    </a>
  );
};

export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="sr-only">{children}</span>;
};

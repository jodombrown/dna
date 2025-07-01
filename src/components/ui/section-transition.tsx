
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fade' | 'slide' | 'scale';
  delay?: number;
  threshold?: number;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  className,
  animationType = 'fade',
  delay = 0,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold]);

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-700 ease-out";
    
    switch (animationType) {
      case 'slide':
        return cn(
          baseClasses,
          isVisible 
            ? "transform translate-y-0 opacity-100" 
            : "transform translate-y-8 opacity-0"
        );
      case 'scale':
        return cn(
          baseClasses,
          isVisible 
            ? "transform scale-100 opacity-100" 
            : "transform scale-95 opacity-0"
        );
      default: // fade
        return cn(
          baseClasses,
          isVisible ? "opacity-100" : "opacity-0"
        );
    }
  };

  return (
    <div
      ref={ref}
      className={cn(getAnimationClasses(), className)}
    >
      {children}
    </div>
  );
};

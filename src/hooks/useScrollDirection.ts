import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseScrollDirectionReturn {
  isScrollingDown: boolean;
  isAtTop: boolean;
  scrollY: number;
}

export const useScrollDirection = (threshold: number = 30): UseScrollDirectionReturn => {
  const [scrollY, setScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  
  // Use refs to avoid triggering re-renders during scroll events
  const lastScrollYRef = useRef(0);
  const directionThresholdRef = useRef(50); // Separate threshold for direction changes
  
  // Debounce scroll position updates
  const debouncedScrollY = useDebounce(scrollY, 10);

  const handleScroll = useCallback(() => {
    const scrollContainer = document.querySelector('[data-scroll-container="main"]') as HTMLElement;
    const currentScrollY = scrollContainer?.scrollTop || window.scrollY;
    
    // Update scroll position immediately for smooth tracking
    setScrollY(currentScrollY);
    setIsAtTop(currentScrollY < 10);
    
    // Only update direction if scroll is significant enough
    const scrollDiff = Math.abs(currentScrollY - lastScrollYRef.current);
    if (scrollDiff > directionThresholdRef.current) {
      const newDirection = currentScrollY > lastScrollYRef.current;
      setIsScrollingDown(newDirection);
      lastScrollYRef.current = currentScrollY;
    }
  }, []);

  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-container="main"]') as HTMLElement;
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
    
    // Fallback to window if container not found
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { isScrollingDown, isAtTop, scrollY: debouncedScrollY };
};
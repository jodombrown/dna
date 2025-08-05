import { useState, useEffect } from 'react';

interface UseScrollDirectionReturn {
  isScrollingDown: boolean;
  isAtTop: boolean;
  scrollY: number;
}

export const useScrollDirection = (threshold: number = 50): UseScrollDirectionReturn => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let lastY = 0;
    
    const handleScroll = () => {
      // Check both window scroll and the main scroll container
      const scrollContainer = document.querySelector('[data-scroll-container="main"]') as HTMLElement;
      const currentScrollY = scrollContainer?.scrollTop || window.scrollY;
      
      setScrollY(currentScrollY);
      setIsAtTop(currentScrollY < 10);
      
      // Only update direction if scroll is significant
      if (Math.abs(currentScrollY - lastY) > threshold) {
        setIsScrollingDown(currentScrollY > lastY);
        lastY = currentScrollY;
      }
    };

    // Add listener to the main scroll container only
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
  }, [threshold]);

  return { isScrollingDown, isAtTop, scrollY };
};
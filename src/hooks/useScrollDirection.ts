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
    const handleScroll = () => {
      // Check both window scroll and the main scroll container
      const scrollContainer = document.querySelector('[data-scroll-container="main"]') as HTMLElement;
      const currentScrollY = scrollContainer?.scrollTop || window.scrollY;
      
      setScrollY(currentScrollY);
      setIsAtTop(currentScrollY < 10);
      
      // Only update direction if scroll is significant
      if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        setIsScrollingDown(currentScrollY > lastScrollY);
        setLastScrollY(currentScrollY);
      }
    };

    // Add listener to both window and the scroll container
    const scrollContainer = document.querySelector('[data-scroll-container="main"]') as HTMLElement;
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, threshold]);

  return { isScrollingDown, isAtTop, scrollY };
};
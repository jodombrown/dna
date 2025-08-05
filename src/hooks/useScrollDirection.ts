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
      const currentScrollY = window.scrollY;
      
      setScrollY(currentScrollY);
      setIsAtTop(currentScrollY < 10);
      
      // Only update direction if scroll is significant
      if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        setIsScrollingDown(currentScrollY > lastScrollY);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, threshold]);

  return { isScrollingDown, isAtTop, scrollY };
};
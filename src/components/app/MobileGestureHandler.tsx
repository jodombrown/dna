import React, { useRef, useEffect } from 'react';

interface MobileGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  className?: string;
}

const MobileGestureHandler = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = '' 
}: MobileGestureHandlerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isSwiping.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isSwiping.current) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX.current);
      const deltaY = Math.abs(touch.clientY - touchStartY.current);
      
      // Only consider horizontal swipes if they're more pronounced than vertical
      if (deltaX > deltaY && deltaX > 30) {
        isSwiping.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);
      
      // Only trigger swipe if horizontal movement is significant and vertical is minimal
      if (Math.abs(deltaX) > 100 && deltaY < 100) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }
      
      isSwiping.current = false;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default MobileGestureHandler;
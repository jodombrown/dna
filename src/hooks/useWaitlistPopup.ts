import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useWaitlistPopup = () => {
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only work on home page
    if (location.pathname !== '/') {
      return;
    }

    // Check localStorage conditions
    const hasJoined = localStorage.getItem('dna_waitlist_joined');
    const hasDismissed = localStorage.getItem('dna_waitlist_dismissed');
    const hasBeenShown = localStorage.getItem('dna_waitlist_shown');
    
    if (hasJoined || hasDismissed || hasBeenShown) {
      console.log('Waitlist popup blocked:', { hasJoined: !!hasJoined, hasDismissed: !!hasDismissed, hasBeenShown: !!hasBeenShown });
      return;
    }

    // Reset triggered state when pathname changes
    setHasTriggered(false);

    const handleScroll = () => {
      if (hasTriggered) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableDistance = documentHeight - windowHeight;
      
      if (scrollableDistance <= 0) return; // Prevent division by zero
      
      const scrollPercentage = (scrollTop / scrollableDistance) * 100;
      
      console.log('Scroll progress:', {
        scrollTop,
        scrollableDistance,
        percentage: Math.round(scrollPercentage),
        windowWidth: window.innerWidth
      });

      // Trigger at 60% for desktop, 90% for mobile
      const isMobile = window.innerWidth < 768;
      const triggerPoint = isMobile ? 90 : 60;

      if (scrollPercentage >= triggerPoint) {
        console.log('🎯 Triggering waitlist popup!');
        setShowWaitlistPopup(true);
        setHasTriggered(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Add scroll listener with throttling to prevent multiple calls
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add throttled scroll listener
    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [location.pathname, hasTriggered]);

  const closeWaitlistPopup = () => {
    setShowWaitlistPopup(false);
    // Mark as shown so it doesn't appear again
    localStorage.setItem('dna_waitlist_shown', Date.now().toString());
  };

  const dismissWaitlistPopup = () => {
    setShowWaitlistPopup(false);
    localStorage.setItem('dna_waitlist_dismissed', Date.now().toString());
  };

  // Force show for testing (you can call this from console)
  const forceShow = () => {
    setShowWaitlistPopup(true);
  };

  // Expose forceShow to window for testing
  useEffect(() => {
    (window as any).forceWaitlistPopup = forceShow;
    return () => {
      delete (window as any).forceWaitlistPopup;
    };
  }, []);

  return {
    showWaitlistPopup,
    closeWaitlistPopup,
    dismissWaitlistPopup
  };
};
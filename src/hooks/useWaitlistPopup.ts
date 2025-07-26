import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useWaitlistPopup = () => {
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Only show on home page
    if (location.pathname !== '/') {
      return;
    }

    // Check if user has already joined waitlist or dismissed popup
    const hasJoinedWaitlist = localStorage.getItem('dna_waitlist_joined');
    const hasDismissedPopup = localStorage.getItem('dna_waitlist_dismissed');
    const lastShown = localStorage.getItem('dna_waitlist_last_shown');
    
    // Don't show if user already joined or dismissed recently (within 7 days)
    if (hasJoinedWaitlist || hasDismissedPopup) {
      if (hasDismissedPopup) {
        const dismissedTime = parseInt(hasDismissedPopup);
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        // If dismissed more than 7 days ago, show again
        if (dismissedTime < sevenDaysAgo) {
          localStorage.removeItem('dna_waitlist_dismissed');
        } else {
          return;
        }
      } else {
        return;
      }
    }

    // Don't show more than once per session
    if (lastShown) {
      const lastShownTime = parseInt(lastShown);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastShownTime > oneHourAgo) {
        return;
      }
    }

    // Scroll-based trigger with smooth progress
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      
      // Debug logging
      console.log('Scroll debug:', {
        scrollTop,
        documentHeight: document.documentElement.scrollHeight,
        windowHeight: window.innerHeight,
        scrollPercentage: scrollPercentage.toFixed(1)
      });
      
      // Update scroll progress for smooth animation
      setScrollProgress(scrollPercentage);
      
      // Check if mobile
      const isMobile = window.innerWidth < 768;
      const triggerPercentage = isMobile ? 100 : 80;
      
      console.log('Trigger check:', {
        isMobile,
        triggerPercentage,
        currentPercentage: scrollPercentage,
        shouldTrigger: scrollPercentage >= triggerPercentage
      });
      
      if (scrollPercentage >= triggerPercentage) {
        console.log('Triggering waitlist popup!');
        setShowWaitlistPopup(true);
        localStorage.setItem('dna_waitlist_last_shown', Date.now().toString());
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const closeWaitlistPopup = () => {
    setShowWaitlistPopup(false);
  };

  const dismissWaitlistPopup = () => {
    setShowWaitlistPopup(false);
    localStorage.setItem('dna_waitlist_dismissed', Date.now().toString());
  };

  return {
    showWaitlistPopup,
    scrollProgress,
    closeWaitlistPopup,
    dismissWaitlistPopup
  };
};
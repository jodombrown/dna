import { useState, useEffect } from 'react';

export const useWaitlistPopup = () => {
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);

  useEffect(() => {
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

    // Show popup after 3 seconds delay
    const timer = setTimeout(() => {
      setShowWaitlistPopup(true);
      localStorage.setItem('dna_waitlist_last_shown', Date.now().toString());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const closeWaitlistPopup = () => {
    setShowWaitlistPopup(false);
  };

  const dismissWaitlistPopup = () => {
    setShowWaitlistPopup(false);
    localStorage.setItem('dna_waitlist_dismissed', Date.now().toString());
  };

  return {
    showWaitlistPopup,
    closeWaitlistPopup,
    dismissWaitlistPopup
  };
};
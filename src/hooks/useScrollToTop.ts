
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if this is a back navigation by looking at the history state
    const isBackNavigation = window.history.state && window.history.state.idx !== undefined && window.history.state.idx < window.performance.navigation.TYPE_BACK_FORWARD;
    
    // Only scroll to top if it's NOT a back navigation
    if (!isBackNavigation) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
};

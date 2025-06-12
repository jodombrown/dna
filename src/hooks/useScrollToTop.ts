
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top on route changes, not when going back
    const isGoingBack = window.history.state && window.history.state.idx > 0;
    
    if (!isGoingBack) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
};

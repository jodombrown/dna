
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Only scroll to top for new navigation (not back/forward)
    // The browser handles scroll restoration for back/forward navigation
    if (location.state?.preserveScroll !== true) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.state]);
};

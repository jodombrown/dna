
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Always scroll to top when the pathname changes
    window.scrollTo(0, 0);
  }, [location.pathname]);
};

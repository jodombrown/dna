
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Store scroll positions for different routes
const scrollPositions = new Map<string, number>();

export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Store current scroll position before navigation
    const handleBeforeUnload = () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };

    // Handle browser back/forward navigation
    const handlePopState = () => {
      const savedPosition = scrollPositions.get(location.pathname);
      if (savedPosition !== undefined) {
        // Restore previous scroll position
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 100);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // For normal navigation (not back/forward), scroll to top
    if (!window.history.state?.fromBack) {
      window.scrollTo(0, 0);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);
};

export const useScrollManager = () => {
  const location = useLocation();

  const navigateWithScrollReset = (navigate: (path: string) => void, path: string) => {
    // Store current scroll position
    scrollPositions.set(location.pathname, window.scrollY);
    // Navigate to new page
    navigate(path);
  };

  return { navigateWithScrollReset };
};

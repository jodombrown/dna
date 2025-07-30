
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollBehaviorSettings {
  auto_scroll_restoration: boolean;
  default_scroll_position: 'top' | 'bottom' | 'maintain';
  preserve_scroll_on_back: boolean;
  scroll_behavior: 'smooth' | 'instant';
}

const defaultSettings: ScrollBehaviorSettings = {
  auto_scroll_restoration: true,
  default_scroll_position: 'top',
  preserve_scroll_on_back: true,
  scroll_behavior: 'smooth'
};

export const useScrollToTop = (settings: Partial<ScrollBehaviorSettings> = {}) => {
  const location = useLocation();
  const previousLocationRef = useRef<string | null>(null);
  const config = { ...defaultSettings, ...settings };

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocationRef.current;
    
    // Determine navigation type
    const isBackOrForward = window.history.state && 
      window.performance.navigation && 
      window.performance.navigation.type === 2;
    
    const isNewPage = !isBackOrForward && previousPath !== null && previousPath !== currentPath;
    const isInitialLoad = previousPath === null;

    // Handle different navigation scenarios
    if (isBackOrForward && config.preserve_scroll_on_back) {
      // Let browser handle scroll restoration for back/forward navigation
      return;
    }

    if (isNewPage || isInitialLoad) {
      // New page navigation - scroll to default position
      if (config.default_scroll_position === 'top' && !location.state?.preserveScroll) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: config.scroll_behavior
        });
      } else if (config.default_scroll_position === 'bottom') {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          left: 0,
          behavior: config.scroll_behavior
        });
      }
      // 'maintain' option does nothing - preserves current scroll position
    }

    // Update previous path reference
    previousLocationRef.current = currentPath;
  }, [location.pathname, location.state, config]);

  // Enable browser scroll restoration if configured
  useEffect(() => {
    if (config.auto_scroll_restoration && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    } else if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, [config.auto_scroll_restoration]);
};


import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions: Record<string, number> = {};

export function useScrollRestore() {
  const location = useLocation();

  useEffect(() => {
    // Before route changes, save scroll position
    const handlePopState = () => {
      scrollPositions[location.pathname] = window.scrollY;
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  useEffect(() => {
    // On path change, restore or scroll to top
    const prev = scrollPositions[location.pathname];
    if (typeof prev === 'number') {
      setTimeout(() => window.scrollTo(0, prev), 0);
    } else {
      setTimeout(() => window.scrollTo(0, 0), 0);
    }
    // Save on unload
    return () => {
      scrollPositions[location.pathname] = window.scrollY;
    };
  }, [location.pathname]);
}

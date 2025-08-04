import { useState, useEffect } from 'react';

// Enhanced mobile hook with more granular breakpoints and device detection
const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  xl: 1280,
} as const;

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type BreakpointKey = keyof typeof BREAKPOINTS;

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  width: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
}

export function useMobile(): MobileState {
  const [state, setState] = useState<MobileState>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        deviceType: 'desktop',
        width: 1024,
        orientation: 'landscape',
        isTouch: false,
      };
    }

    const width = window.innerWidth;
    const isMobile = width < BREAKPOINTS.tablet;
    const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
    const isDesktop = width >= BREAKPOINTS.desktop;
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      isMobile,
      isTablet,
      isDesktop,
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      width,
      orientation,
      isTouch,
    };
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const isMobile = width < BREAKPOINTS.tablet;
      const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
      const isDesktop = width >= BREAKPOINTS.desktop;
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setState({
        isMobile,
        isTablet,
        isDesktop,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        width,
        orientation,
        isTouch,
      });
    };

    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet - 1}px)`);
    const orientationQuery = window.matchMedia('(orientation: portrait)');
    
    mediaQuery.addEventListener('change', updateState);
    orientationQuery.addEventListener('change', updateState);
    window.addEventListener('resize', updateState);

    return () => {
      mediaQuery.removeEventListener('change', updateState);
      orientationQuery.removeEventListener('change', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, []);

  return state;
}

// Legacy compatibility hook
export function useIsMobile(): boolean {
  const { isMobile } = useMobile();
  return isMobile;
}

// Utility hook for specific breakpoints
export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  const { width } = useMobile();
  return width >= BREAKPOINTS[breakpoint];
}
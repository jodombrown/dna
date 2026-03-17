import { useEffect, useRef, type RefObject } from 'react';

/**
 * Sets a CSS custom property on :root equal to the observed element's height.
 * This is the **standard** way to communicate header height to the rest of
 * the layout.  Any component that needs to offset below a fixed/sticky header
 * reads the variable instead of hard-coding `top-14` / `pt-16` etc.
 *
 * Variables set by the platform:
 *   --unified-header-height   (UnifiedHeader, ~56-64px)
 *   --pulse-bar-height        (PulseBar, ~56px, 0 on mobile)
 *   --total-header-height     (sum of the two, convenience var)
 *
 * Usage:
 *   const ref = useRef<HTMLElement>(null);
 *   useSetCSSHeaderHeight(ref, '--unified-header-height');
 */
export function useSetCSSHeaderHeight(
  ref: RefObject<HTMLElement | null>,
  varName: string,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(varName, `${h}px`);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty(varName);
    };
  }, [ref, varName]);
}

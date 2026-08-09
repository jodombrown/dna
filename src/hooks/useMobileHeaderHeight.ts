import { useLayoutEffect, useState, type RefObject } from 'react';

/** Extra pixels added below the measured header so content never touches it */
const BUFFER_PX = 0;

/**
 * Measures the actual rendered height of a fixed mobile header container
 * via ResizeObserver and returns a pixel value suitable for padding-top.
 *
 * Usage:
 *   const headerRef = useRef<HTMLDivElement>(null);
 *   const headerHeight = useMobileHeaderHeight(headerRef);
 *   <main style={{ paddingTop: headerHeight }}>
 */
export function useMobileHeaderHeight(
  ref: RefObject<HTMLElement | null>,
  buffer: number = BUFFER_PX,
): number {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setHeight(Math.ceil(rect.height) + buffer);
    };

    // Initial measurement
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [ref, buffer]);

  return height;
}

import { useEffect, useState, type RefObject } from 'react';

/** Extra pixels added below the measured header so content never touches it */
const BUFFER_PX = 12;

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

  useEffect(() => {
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

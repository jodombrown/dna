import React from 'react';
import { cn } from '@/lib/utils';

type PatternName = 'kente' | 'mudcloth' | 'ndebele' | 'adinkra';

interface CulturalPatternProps {
  pattern: PatternName;
  opacity?: number;
  className?: string;
}

const PATTERN_PATHS: Record<PatternName, string> = {
  kente: '/patterns/kente-pattern.svg',
  mudcloth: '/patterns/mudcloth-pattern.svg',
  ndebele: '/patterns/ndebele-pattern.svg',
  adinkra: '/patterns/adinkra-pattern.svg',
};

/**
 * CulturalPattern — renders an absolutely-positioned, repeating SVG pattern overlay.
 *
 * Usage:
 *   <div className="relative overflow-hidden">
 *     <CulturalPattern pattern="kente" opacity={0.05} />
 *     {children}
 *   </div>
 *
 * Respects `prefers-reduced-motion` — hides when the user prefers reduced motion.
 */
export function CulturalPattern({
  pattern,
  opacity = 0.06,
  className,
}: CulturalPatternProps) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 bg-repeat pointer-events-none',
        className,
      )}
      style={{
        backgroundImage: `url("${PATTERN_PATHS[pattern]}")`,
        opacity,
      }}
    />
  );
}

export default CulturalPattern;

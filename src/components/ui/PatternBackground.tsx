import React from 'react';
import { PATTERNS, type PatternName, type PatternIntensity } from '@/lib/patterns.config';
import { cn } from '@/lib/utils';

interface PatternBackgroundProps {
  pattern: PatternName;
  intensity?: PatternIntensity;
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayClassName?: string;
}

/**
 * PatternBackground — wraps content with an African heritage pattern.
 *
 * Intensity levels (PRD §6.1):
 *   subtle     0.03 — large areas (page backgrounds)
 *   moderate   0.06 — section accents
 *   prominent  0.10 — featured moments, celebrations
 *   decorative 0.15 — empty states, badges
 */
export const PatternBackground: React.FC<PatternBackgroundProps> = ({
  pattern,
  intensity = 'subtle',
  children,
  className = '',
  overlay = false,
  overlayClassName = 'bg-background/50',
}) => {
  const patternUrl = PATTERNS[pattern][intensity];

  return (
    <div
      className={cn('relative', className)}
      style={{
        backgroundImage: `url("${patternUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      {overlay && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default PatternBackground;

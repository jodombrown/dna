import React from 'react';
import { PATTERNS } from '@/lib/patterns.config';
import { cn } from '@/lib/utils';

interface PatternBackgroundProps {
  pattern: keyof typeof PATTERNS;
  intensity?: 'subtle' | 'medium' | 'bold';
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayClassName?: string;
}

/**
 * PatternBackground Component
 * 
 * Wraps content with an African-inspired geometric pattern background.
 * Patterns are subtle by default to avoid overwhelming content.
 * 
 * @example
 * ```tsx
 * <PatternBackground pattern="kente" intensity="subtle">
 *   <div>Your content here</div>
 * </PatternBackground>
 * ```
 * 
 * @example With overlay for better text readability
 * ```tsx
 * <PatternBackground 
 *   pattern="mudcloth" 
 *   intensity="medium"
 *   overlay
 *   overlayClassName="bg-white/80"
 * >
 *   <div className="relative z-10">Your content here</div>
 * </PatternBackground>
 * ```
 */
export const PatternBackground: React.FC<PatternBackgroundProps> = ({
  pattern,
  intensity = 'subtle',
  children,
  className = '',
  overlay = false,
  overlayClassName = 'bg-white/50',
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
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PatternBackground;

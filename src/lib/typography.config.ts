/**
 * DNA Platform Typography System
 * 
 * Standardized typography tokens for consistent visual hierarchy.
 * Use these instead of inline Tailwind classes for better maintainability.
 * 
 * @example
 * import { TYPOGRAPHY } from '@/lib/typography.config';
 * <h1 className={TYPOGRAPHY.h1}>Page Title</h1>
 */

export const TYPOGRAPHY = {
  // Display (Hero moments only - landing pages, major announcements)
  display: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  
  // Headings (Standard hierarchy)
  h1: 'text-3xl md:text-4xl font-bold leading-tight',
  h2: 'text-2xl md:text-3xl font-semibold leading-tight',
  h3: 'text-xl md:text-2xl font-semibold leading-snug',
  h4: 'text-lg md:text-xl font-semibold leading-snug',
  h5: 'text-base md:text-lg font-semibold leading-normal',
  h6: 'text-sm md:text-base font-semibold leading-normal',
  
  // Body Text
  bodyLarge: 'text-base md:text-lg font-normal leading-relaxed',
  body: 'text-sm md:text-base font-normal leading-relaxed',
  bodySmall: 'text-xs md:text-sm font-normal leading-relaxed',
  
  // Special Cases
  caption: 'text-xs font-normal leading-normal text-muted-foreground',
  overline: 'text-xs font-semibold uppercase tracking-wide',
  
  // Stats/Numbers (Large display numbers for dashboards)
  statLarge: 'text-3xl md:text-4xl font-bold',
  statMedium: 'text-2xl md:text-3xl font-bold',
  statSmall: 'text-xl md:text-2xl font-bold',
} as const;

/**
 * Typography Usage Guidelines:
 * 
 * - H1: Page titles, main hero headlines (1 per page max)
 * - H2: Major section headings
 * - H3: Subsection headings, card titles
 * - H4: Widget titles, small card headings
 * - H5: List section headers
 * - H6: Inline section labels
 * 
 * - Display: Only for hero sections on landing pages
 * - Body Large: Feature descriptions, important paragraphs
 * - Body: Default paragraph text
 * - Body Small: Secondary information, metadata
 * - Caption: Image captions, footnotes, timestamps
 * - Overline: Category labels, section tags
 * - Stat: Dashboard numbers, metrics, counts
 */

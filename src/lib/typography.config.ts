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
  display: 'font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  
  // Headings (Standard hierarchy) - Serif for cultural warmth
  h1: 'font-serif text-3xl md:text-4xl font-bold leading-tight',
  h2: 'font-serif text-2xl md:text-3xl font-semibold leading-tight',
  h3: 'font-serif text-xl md:text-2xl font-semibold leading-snug',
  h4: 'font-serif text-lg md:text-xl font-semibold leading-snug',
  h5: 'font-serif text-base md:text-lg font-semibold leading-normal',
  h6: 'font-serif text-sm md:text-base font-semibold leading-normal',
  
  // Body Text - Sans-serif for readability
  bodyLarge: 'font-sans text-base md:text-lg font-normal leading-relaxed',
  body: 'font-sans text-sm md:text-base font-normal leading-relaxed',
  bodySmall: 'font-sans text-xs md:text-sm font-normal leading-relaxed',
  
  // Special Cases
  caption: 'font-sans text-xs font-normal leading-normal text-muted-foreground',
  overline: 'font-sans text-xs font-semibold uppercase tracking-wide',
  
  // Stats/Numbers (Large display numbers for dashboards)
  statLarge: 'font-serif text-3xl md:text-4xl font-bold',
  statMedium: 'font-serif text-2xl md:text-3xl font-bold',
  statSmall: 'font-serif text-xl md:text-2xl font-bold',
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

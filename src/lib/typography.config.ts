/**
 * DNA Platform Typography System
 * 
 * CRITICAL: All titles and headings MUST use the Lora serif font (font-serif).
 * This is locked in as the brand standard for DNA.
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
  // MUST use font-serif (Lora)
  display: 'font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  
  // Headings (Standard hierarchy) - MUST use font-serif (Lora) for all titles
  h1: 'font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
  h2: 'font-serif text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight',
  h3: 'font-serif text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  h4: 'font-serif text-lg md:text-xl lg:text-2xl font-semibold leading-snug',
  h5: 'font-serif text-base md:text-lg lg:text-xl font-semibold leading-normal',
  h6: 'font-serif text-sm md:text-base lg:text-lg font-semibold leading-normal',
  
  // Body Text - Sans-serif for readability
  bodyLarge: 'font-sans text-base md:text-lg font-normal leading-relaxed',
  body: 'font-sans text-sm md:text-base font-normal leading-relaxed',
  bodySmall: 'font-sans text-xs md:text-sm font-normal leading-relaxed',
  
  // Special Cases
  caption: 'font-sans text-xs font-normal leading-normal text-muted-foreground',
  overline: 'font-sans text-xs font-semibold uppercase tracking-wide',
  
  // Stats/Numbers (Large display numbers for dashboards) - Use serif for impact
  statLarge: 'font-serif text-3xl md:text-4xl font-bold',
  statMedium: 'font-serif text-2xl md:text-3xl font-bold',
  statSmall: 'font-serif text-xl md:text-2xl font-bold',
} as const;

/**
 * Typography Usage Guidelines:
 * 
 * BRANDING RULE: All headings (h1-h6) and display text MUST use font-serif (Lora).
 * This is non-negotiable for brand consistency.
 * 
 * - H1: Page titles, main hero headlines (1 per page max) - ALWAYS font-serif
 * - H2: Major section headings - ALWAYS font-serif
 * - H3: Subsection headings, card titles - ALWAYS font-serif
 * - H4: Widget titles, small card headings - ALWAYS font-serif
 * - H5: List section headers - ALWAYS font-serif
 * - H6: Inline section labels - ALWAYS font-serif
 * 
 * - Display: Only for hero sections on landing pages - ALWAYS font-serif
 * - Body Large: Feature descriptions, important paragraphs - Use sans-serif
 * - Body: Default paragraph text - Use sans-serif
 * - Body Small: Secondary information, metadata - Use sans-serif
 * - Caption: Image captions, footnotes, timestamps - Use sans-serif
 * - Overline: Category labels, section tags - Use sans-serif
 * - Stat: Dashboard numbers, metrics, counts - Use font-serif for impact
 * 
 * IMPORTANT: When creating custom heading styles, ALWAYS include 'font-serif'.
 * Example: className="text-2xl font-bold font-serif text-dna-forest"
 */

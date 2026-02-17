/**
 * DNA Platform Typography System (Design System PRD v1.0)
 * 
 * FONT RULES:
 * - Lora (heritage/serif): Display, H1, H2, profile names, DIA insights, 
 *   onboarding, empty states, stat numbers — emotional weight
 * - Inter (ui/sans): H3+, body, buttons, inputs, nav, metadata — functional clarity
 * 
 * @example
 * import { TYPOGRAPHY } from '@/lib/typography.config';
 * <h1 className={TYPOGRAPHY.h1}>Page Title</h1>
 */

export const TYPOGRAPHY = {
  // Display — hero moments, onboarding screens (Lora heritage)
  display: 'font-heritage text-[32px] md:text-[40px] font-bold leading-[1.2] tracking-[-0.02em]',
  
  // Headings — H1/H2 use heritage (Lora), H3+ use UI (Inter)
  h1: 'font-heritage text-[24px] md:text-[28px] font-bold leading-[1.3] tracking-[-0.01em]',
  h2: 'font-heritage text-[20px] md:text-[22px] font-semibold leading-[1.3]',
  h3: 'font-ui text-[17px] md:text-[18px] font-semibold leading-[1.4]',
  h4: 'font-ui text-base md:text-lg font-semibold leading-snug',
  h5: 'font-ui text-sm md:text-base font-semibold leading-normal',
  h6: 'font-ui text-xs md:text-sm font-semibold leading-normal',
  
  // Body Text — Inter for readability
  bodyLarge: 'font-ui text-[16px] md:text-[17px] font-normal leading-[1.6]',
  body: 'font-ui text-[15px] font-normal leading-[1.55]',
  bodySmall: 'font-ui text-[13px] md:text-[14px] font-normal leading-[1.5]',
  
  // Special Cases
  caption: 'font-ui text-[12px] font-normal leading-[1.4] text-muted-foreground tracking-[0.02em]',
  overline: 'font-ui text-[11px] font-semibold uppercase tracking-[0.08em] leading-[1.4]',
  
  // Button / Input
  button: 'font-ui text-[15px] font-semibold leading-[1.2] tracking-[0.01em]',
  input: 'font-ui text-[16px] md:text-[15px] font-normal leading-[1.5]',
  
  // Stats/Numbers — Lora for impact on dashboards
  statLarge: 'font-heritage text-3xl md:text-4xl font-bold',
  statMedium: 'font-heritage text-2xl md:text-3xl font-bold',
  statSmall: 'font-heritage text-xl md:text-2xl font-bold',
} as const;

/**
 * Typography Usage Guidelines (Design System PRD):
 * 
 * HERITAGE FONT (Lora — font-heritage / font-serif):
 * - Display: Hero sections, landing pages, onboarding
 * - H1: Page titles, profile names (1 per page max)
 * - H2: Major section headings
 * - DIA insight cards (bodyLg italic with Lora)
 * - Stat numbers on dashboards
 * - Empty state headlines
 * - Heritage card generation badges
 * 
 * UI FONT (Inter — font-ui / font-sans):
 * - H3+: Card titles, subsections, widget titles
 * - All body text (body, bodyLg, bodySm)
 * - Buttons, inputs, navigation labels
 * - Captions, timestamps, overlines
 * - Notification headlines
 * - Tags and badges
 * 
 * CRITICAL: Input font-size must be 16px on mobile to prevent iOS zoom.
 */

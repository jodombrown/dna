/**
 * Shared mobile header spacing constants
 *
 * Pages with a stacked mobile header (top header row + tabs/filter row)
 * use these values so padding stays consistent across Feed, Connect, etc.
 *
 * Layout:
 *   Row 1 – MobileHeader / ConnectMobileHeader  (h-14 = 56px)
 *   Row 2 – Tabs / Filter bar                    (~40-44px)
 *   Buffer – small gap so content never bleeds    (~4px)
 *
 * When the header hides on scroll-down, only the tabs row remains
 * fixed at top-0, so the content offset shrinks.
 */

/** Tailwind class for content padding when both header rows are visible (fallback) */
export const MOBILE_STACKED_HEADER_VISIBLE = 'pt-[7.25rem]'; // 116px (105px measured + 11px buffer)

/** Tailwind class for content padding when top header row is hidden (fallback) */
export const MOBILE_STACKED_HEADER_HIDDEN = 'pt-[3.75rem]'; // 60px (48px measured + 12px buffer)

/** z-index for the top header row (must beat UnifiedHeader) */
export const MOBILE_HEADER_Z = 'z-50';

/** z-index for the second row (tabs / filters) */
export const MOBILE_TABS_Z = 'z-30';

/** Position of the tabs row when the header is visible (below h-14 header) */
export const MOBILE_TABS_TOP_VISIBLE = 'top-14';

/** Position of the tabs row when the header is hidden */
export const MOBILE_TABS_TOP_HIDDEN = 'top-0';

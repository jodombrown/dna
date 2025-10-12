/**
 * DNA Platform Spacing System (8pt Grid)
 * 
 * Consistent spacing scale based on 8pt increments.
 * Use these tokens instead of arbitrary spacing values.
 */

export const SPACING = {
  // Base spacing units (8pt grid)
  xs: '4px',    // 0.5 (4px)  - Tight spacing, icon gaps
  sm: '8px',    // 1 (8px)    - Small gaps, compact elements
  md: '16px',   // 2 (16px)   - Default spacing, component padding
  lg: '24px',   // 3 (24px)   - Section spacing, card padding
  xl: '32px',   // 4 (32px)   - Large section gaps
  '2xl': '48px', // 6 (48px)  - Major section spacing
  '3xl': '64px', // 8 (64px)  - Hero section spacing
  
  // Tailwind class equivalents (use these in className)
  tailwind: {
    xs: 'space-y-1 gap-1 p-1',
    sm: 'space-y-2 gap-2 p-2',
    md: 'space-y-4 gap-4 p-4',
    lg: 'space-y-6 gap-6 p-6',
    xl: 'space-y-8 gap-8 p-8',
    '2xl': 'space-y-12 gap-12 p-12',
    '3xl': 'space-y-16 gap-16 p-16',
  },
} as const;

/**
 * Component-Specific Spacing Standards:
 */

export const COMPONENT_SPACING = {
  // Card Padding (standardized from audit findings)
  card: {
    mobile: 'p-4',          // 16px on mobile
    desktop: 'md:p-6',      // 24px on desktop
    combined: 'p-4 md:p-6', // Responsive (use this most often)
    compact: 'p-3 md:p-4',  // Compact cards (lists, tight layouts)
  },
  
  // Section Padding (page sections, containers)
  section: {
    mobile: 'py-8 px-4',
    desktop: 'md:py-12 md:px-6 lg:py-16 lg:px-8',
    combined: 'py-8 px-4 md:py-12 md:px-6 lg:py-16 lg:px-8',
  },
  
  // Stack Spacing (vertical rhythm for content)
  stack: {
    tight: 'space-y-2',   // Related items (form labels + inputs)
    normal: 'space-y-4',  // Default (paragraphs, list items)
    relaxed: 'space-y-6', // Sections within a component
    loose: 'space-y-8',   // Major component sections
  },
  
  // Grid Gaps
  grid: {
    tight: 'gap-2 md:gap-3',
    normal: 'gap-3 md:gap-4 lg:gap-6',
    relaxed: 'gap-4 md:gap-6 lg:gap-8',
  },
} as const;

/**
 * Usage Examples:
 * 
 * Card:
 * ```tsx
 * <Card className={COMPONENT_SPACING.card.combined}>
 *   <CardContent>...</CardContent>
 * </Card>
 * ```
 * 
 * Section:
 * ```tsx
 * <section className={COMPONENT_SPACING.section.combined}>
 *   <div className={COMPONENT_SPACING.stack.normal}>
 *     <h2>Title</h2>
 *     <p>Content</p>
 *   </div>
 * </section>
 * ```
 * 
 * Grid:
 * ```tsx
 * <div className={`grid grid-cols-1 md:grid-cols-3 ${COMPONENT_SPACING.grid.normal}`}>
 *   {items.map(...)}
 * </div>
 * ```
 */

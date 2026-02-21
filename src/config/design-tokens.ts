/**
 * DNA | Design System — Formalized Design Tokens
 *
 * The visual DNA that makes every component, every screen, and every interaction
 * feel like one platform. Cultural authenticity is structural, not decorative.
 *
 * Token categories:
 * - Color (semantic + Five C's accents)
 * - Typography (Inter for UI, Lora for heritage moments)
 * - Spacing (4px base unit)
 * - Elevation (warm shadows)
 * - Radius (consistent rounding)
 * - Motion (organic, never jarring)
 * - Cultural patterns (SVG at 3-5% opacity)
 */

// =====================================================
// COLOR TOKENS
// =====================================================

/** Core brand colors with hex values */
export const COLOR_TOKENS = {
  // Core brand
  emerald: '#4A8D77',
  forest: '#2D5A3D',
  copper: '#B87333',
  gold: '#C4942A',
  deepTeal: '#2A7A8C',

  // Cultural warm tones
  terra: '#A0522D',
  ochre: '#CC7722',
  sunset: '#E07328',
  purple: '#6B4C8A',

  // Warm neutrals (never clinical)
  cream: '#F9F7F4',
  pearl: '#F5F0EB',
  sand: '#E8DFD5',
  charcoal: '#2D2D2D',
  slate: '#64748B',

  // Semantic
  success: '#4A8D77', // Emerald
  warning: '#C4942A', // Gold
  error: '#C75454',   // Custom warm red (not stark red)
  info: '#2A7A8C',    // Deep Teal
} as const;

/** Five C's accent color mapping */
export const FIVE_C_COLORS = {
  connect: {
    primary: COLOR_TOKENS.emerald,
    name: 'Emerald',
    cssVar: '--dna-emerald',
    description: 'Emerald accents - growth, connection, harmony',
  },
  convene: {
    primary: COLOR_TOKENS.gold,
    name: 'Amber-Gold',
    cssVar: '--dna-gold',
    description: 'Amber-Gold accents - warmth, gathering, celebration',
  },
  collaborate: {
    primary: COLOR_TOKENS.forest,
    name: 'Forest Green',
    cssVar: '--dna-forest',
    description: 'Forest Green accents - depth, stability, teamwork',
  },
  contribute: {
    primary: COLOR_TOKENS.copper,
    name: 'Copper',
    cssVar: '--dna-copper',
    description: 'Copper accents - value, craftsmanship, contribution',
  },
  convey: {
    primary: COLOR_TOKENS.deepTeal,
    name: 'Deep Teal',
    cssVar: '--dna-ocean',
    description: 'Deep Teal accents - knowledge, depth, storytelling',
  },
} as const;

/** Feed card bevel colors per content type */
export const BEVEL_COLORS = {
  post: COLOR_TOKENS.emerald,
  story: COLOR_TOKENS.deepTeal,
  event: COLOR_TOKENS.gold,
  space: COLOR_TOKENS.forest,
  opportunity: COLOR_TOKENS.copper,
} as const;

// =====================================================
// TYPOGRAPHY TOKENS
// =====================================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'Inter, sans-serif',                    // UI text
    serif: 'Lora, serif',                          // Heritage moments
    display: 'Cormorant Garamond, serif',          // Display titles
    body: 'Outfit, sans-serif',                    // Body alternative
  },

  /** Type scale — mobile-first with desktop overrides */
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px — mobile secondary min
    base: '1rem',      // 16px — mobile body min
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  /** When to use heritage typography (Lora/Cormorant) */
  heritageUsage: [
    'Page titles and hero headings',
    'Celebration and milestone moments',
    'Profile display names on profile pages',
    'Event titles on event detail pages',
    'Weekly digest headers',
  ] as const,
} as const;

// =====================================================
// SPACING TOKENS
// =====================================================

/** 4px base unit spacing scale */
export const SPACING = {
  '0.5': '2px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
} as const;

// =====================================================
// ELEVATION TOKENS
// =====================================================

/** Warm shadows (slightly tinted, not pure black) */
export const ELEVATION = {
  subtle: '0 1px 2px 0 rgba(45, 45, 45, 0.05)',
  medium: '0 4px 6px -1px rgba(45, 45, 45, 0.08), 0 2px 4px -2px rgba(45, 45, 45, 0.05)',
  raised: '0 10px 15px -3px rgba(45, 45, 45, 0.08), 0 4px 6px -4px rgba(45, 45, 45, 0.05)',
  floating: '0 20px 25px -5px rgba(45, 45, 45, 0.10), 0 8px 10px -6px rgba(45, 45, 45, 0.05)',
} as const;

// =====================================================
// RADIUS TOKENS
// =====================================================

export const RADIUS = {
  sm: '4px',     // Inputs, small elements
  md: '8px',     // Cards
  lg: '12px',    // Modals, sheets
  full: '9999px', // Pills, circular
} as const;

// =====================================================
// MOTION TOKENS
// =====================================================

/** Organic motion — never jarring */
export const MOTION = {
  /** Micro interactions (hover, focus, toggle) */
  micro: {
    duration: '200ms',
    easing: 'ease',
  },
  /** Sheet/drawer transitions */
  sheet: {
    duration: '300ms',
    easing: 'ease-out',
  },
  /** Page/view transitions */
  page: {
    duration: '400ms',
    easing: 'ease',
  },
  /** Celebration animations (milestone moments) */
  celebration: {
    duration: '600ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// =====================================================
// CULTURAL PATTERN TOKENS
// =====================================================

/**
 * Cultural patterns are used as subtle textures at 3-5% opacity.
 * They are felt more than seen — structural, not decorative.
 */
export const CULTURAL_PATTERNS = {
  kente: {
    name: 'Kente',
    origin: 'Ghana / Ashanti',
    usage: 'Achievement and celebration moments',
    opacity: 0.04,
  },
  ndebele: {
    name: 'Ndebele',
    origin: 'South Africa',
    usage: 'Creative and artistic contexts',
    opacity: 0.03,
  },
  mudcloth: {
    name: 'Mudcloth (Bògòlanfini)',
    origin: 'Mali / West Africa',
    usage: 'Background textures for content areas',
    opacity: 0.03,
  },
  adinkra: {
    name: 'Adinkra',
    origin: 'Ghana',
    usage: 'Symbol accents for empty states and loading',
    opacity: 0.05,
  },
} as const;

// =====================================================
// CULTURAL DESIGN PRINCIPLES
// =====================================================

/**
 * The seven cultural design principles that guide every component.
 * These are enforced through code review and design system documentation.
 */
export const CULTURAL_PRINCIPLES = [
  {
    id: 'patterns-as-texture',
    principle: 'Patterns as texture, not decoration',
    guidance: '3-5% opacity, felt more than seen. Never overpowering.',
  },
  {
    id: 'warm-never-clinical',
    principle: 'Warm, never clinical',
    guidance: 'Cream backgrounds (#F9F7F4), warm shadows, no stark white.',
  },
  {
    id: 'heritage-typography',
    principle: 'Heritage typography at moments of significance',
    guidance: 'Lora for titles, celebrations, milestones only. Inter for everything else.',
  },
  {
    id: 'custom-iconography',
    principle: 'Custom iconography',
    guidance: 'DNA icon set supplementing Lucide. Not generic Material/Feather.',
  },
  {
    id: 'photography-over-illustration',
    principle: 'Photography over illustration',
    guidance: 'Real diaspora faces, real places, not generic SaaS blob people.',
  },
  {
    id: 'organic-motion',
    principle: 'Motion that feels organic',
    guidance: 'Ease-in-out curves, gentle transitions, celebratory micro-animations.',
  },
  {
    id: 'language-that-inspires',
    principle: 'Language that inspires',
    guidance: 'Empty states, error messages, onboarding copy all reflect the mission.',
  },
] as const;

// =====================================================
// COMPONENT LIBRARY CATEGORIES
// =====================================================

/**
 * Design system component categories for Storybook organization.
 */
export const COMPONENT_CATEGORIES = {
  primitives: [
    'Button', 'Input', 'TextArea', 'Select', 'Checkbox',
    'Radio', 'Toggle', 'Slider',
  ],
  display: [
    'Card', 'Badge', 'Tag', 'Avatar', 'Icon',
    'Tooltip', 'Divider',
  ],
  feedback: [
    'Toast', 'Alert', 'Modal', 'BottomSheet',
    'Skeleton', 'Spinner',
  ],
  navigation: [
    'TabBar', 'Sidebar', 'Breadcrumb', 'Link', 'Stepper',
  ],
  data: [
    'Table', 'List', 'Grid', 'EmptyState', 'ErrorState',
  ],
  composition: [
    'PageLayout', 'ADAGrid', 'SectionContainer', 'SplitView',
  ],
  dnaSpecific: [
    'FeedCard', 'ComposerShell', 'DIAInsightCard', 'ProfileHeader',
    'ConnectionCard', 'EventCard', 'SpaceCard', 'OpportunityCard',
  ],
} as const;

// =====================================================
// BREAKPOINTS
// =====================================================

export const BREAKPOINTS = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/** Mobile-first: components default to mobile layout, then adapt up */
export const MOBILE_FIRST = {
  min_body_font: '16px',
  min_secondary_font: '14px',
  touch_target_min: '44px',
  bottom_sheet_default: true, // Use BottomSheet over Modal on mobile
} as const;

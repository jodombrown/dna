/**
 * African-inspired geometric patterns for backgrounds and accents
 * Aligned with DNA Design System PRD — Heritage Pattern System
 *
 * Opacity levels (PRD §6.1):
 *   subtle    0.03  — Page backgrounds, large areas
 *   moderate  0.06  — Section accents, smaller areas
 *   prominent 0.10  — Featured moments, celebrations
 *   decorative 0.15 — Empty states, badges (smallest area)
 */

// ── Kente ─────────────────────────────────────────────
// Origin: Ghana / Ashanti — interlocking geometric strips
const kente = {
  subtle: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23C4942A' opacity='0.03'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23B87333' opacity='0.03'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23D4A843' opacity='0.03'/%3E%3Cpath d='M30 30h30v30H30z' fill='%234A8D77' opacity='0.03'/%3E%3C/svg%3E",
  moderate: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23C4942A' opacity='0.06'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23B87333' opacity='0.06'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23D4A843' opacity='0.06'/%3E%3Cpath d='M30 30h30v30H30z' fill='%234A8D77' opacity='0.06'/%3E%3C/svg%3E",
  prominent: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23C4942A' opacity='0.10'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23B87333' opacity='0.10'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23D4A843' opacity='0.10'/%3E%3Cpath d='M30 30h30v30H30z' fill='%234A8D77' opacity='0.10'/%3E%3C/svg%3E",
  decorative: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23C4942A' opacity='0.15'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23B87333' opacity='0.15'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23D4A843' opacity='0.15'/%3E%3Cpath d='M30 30h30v30H30z' fill='%234A8D77' opacity='0.15'/%3E%3C/svg%3E",
} as const;

// ── Ndebele ───────────────────────────────────────────
// Origin: South Africa — bold geometric shapes
const ndebele = {
  subtle: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23B87333' opacity='0.03'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23C4942A' opacity='0.03'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%234A8D77' opacity='0.03'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%232D5A3D' opacity='0.03'/%3E%3C/svg%3E",
  moderate: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23B87333' opacity='0.06'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23C4942A' opacity='0.06'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%234A8D77' opacity='0.06'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%232D5A3D' opacity='0.06'/%3E%3C/svg%3E",
  prominent: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23B87333' opacity='0.10'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23C4942A' opacity='0.10'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%234A8D77' opacity='0.10'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%232D5A3D' opacity='0.10'/%3E%3C/svg%3E",
  decorative: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23B87333' opacity='0.15'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23C4942A' opacity='0.15'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%234A8D77' opacity='0.15'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%232D5A3D' opacity='0.15'/%3E%3C/svg%3E",
} as const;

// ── Mudcloth (Bògòlanfini) ────────────────────────────
// Origin: Mali / West Africa — earthy dots and dashes
const mudcloth = {
  subtle: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%232D5A3D' opacity='0.03'/%3E%3Ccircle cx='30' cy='10' r='1.5' fill='%232D5A3D' opacity='0.03'/%3E%3Ccircle cx='10' cy='30' r='1.5' fill='%232D5A3D' opacity='0.03'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%232D5A3D' opacity='0.03'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%232D5A3D' stroke-width='1' opacity='0.03'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%232D5A3D' stroke-width='1' opacity='0.03'/%3E%3C/svg%3E",
  moderate: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%232D5A3D' opacity='0.06'/%3E%3Ccircle cx='30' cy='10' r='2' fill='%232D5A3D' opacity='0.06'/%3E%3Ccircle cx='10' cy='30' r='2' fill='%232D5A3D' opacity='0.06'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%232D5A3D' opacity='0.06'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%232D5A3D' stroke-width='1.5' opacity='0.06'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%232D5A3D' stroke-width='1.5' opacity='0.06'/%3E%3C/svg%3E",
  prominent: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2.5' fill='%232D5A3D' opacity='0.10'/%3E%3Ccircle cx='30' cy='10' r='2.5' fill='%232D5A3D' opacity='0.10'/%3E%3Ccircle cx='10' cy='30' r='2.5' fill='%232D5A3D' opacity='0.10'/%3E%3Ccircle cx='30' cy='30' r='2.5' fill='%232D5A3D' opacity='0.10'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%232D5A3D' stroke-width='2' opacity='0.10'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%232D5A3D' stroke-width='2' opacity='0.10'/%3E%3C/svg%3E",
  decorative: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='3' fill='%232D5A3D' opacity='0.15'/%3E%3Ccircle cx='30' cy='10' r='3' fill='%232D5A3D' opacity='0.15'/%3E%3Ccircle cx='10' cy='30' r='3' fill='%232D5A3D' opacity='0.15'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%232D5A3D' opacity='0.15'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%232D5A3D' stroke-width='2.5' opacity='0.15'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%232D5A3D' stroke-width='2.5' opacity='0.15'/%3E%3C/svg%3E",
} as const;

// ── Adinkra ───────────────────────────────────────────
// Origin: Ghana / Akan — philosophical symbol motifs (simplified Sankofa)
const adinkra = {
  subtle: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%234A8D77' stroke-width='0.5' opacity='0.03' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23C4942A' stroke-width='0.5' opacity='0.03' fill='none'/%3E%3C/svg%3E",
  moderate: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%234A8D77' stroke-width='0.8' opacity='0.06' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23C4942A' stroke-width='0.8' opacity='0.06' fill='none'/%3E%3C/svg%3E",
  prominent: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%234A8D77' stroke-width='1.2' opacity='0.10' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23C4942A' stroke-width='1.2' opacity='0.10' fill='none'/%3E%3C/svg%3E",
  decorative: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%234A8D77' stroke-width='1.5' opacity='0.15' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23C4942A' stroke-width='1.5' opacity='0.15' fill='none'/%3E%3C/svg%3E",
} as const;

export const PATTERNS = { kente, ndebele, mudcloth, adinkra } as const;

export type PatternName = keyof typeof PATTERNS;
export type PatternIntensity = 'subtle' | 'moderate' | 'prominent' | 'decorative';

/** Heritage metadata per pattern (PRD §6.1) */
export const PATTERN_META: Record<PatternName, { origin: string; description: string }> = {
  kente: { origin: 'Ghana / Ashanti', description: 'Interlocking geometric strips symbolizing unity and creativity' },
  ndebele: { origin: 'South Africa', description: 'Bold geometric shapes representing identity and resilience' },
  mudcloth: { origin: 'Mali / West Africa', description: 'Earthy symbols representing knowledge and tradition' },
  adinkra: { origin: 'Ghana / Akan', description: 'Philosophical symbols encoding proverbs and values' },
};

/**
 * Helper — returns inline style for a repeating pattern background
 */
export const applyPattern = (
  pattern: PatternName,
  intensity: PatternIntensity = 'subtle',
) => ({
  backgroundImage: `url("${PATTERNS[pattern][intensity]}")`,
  backgroundRepeat: 'repeat' as const,
  backgroundSize: 'auto' as const,
});

/**
 * PRD §6.2 — Pattern application map
 *
 *  Location                        Pattern      Opacity
 *  ─────────────────────────────── ─────────── ────────
 *  Feed background (behind cards)  Mudcloth    subtle (0.03)
 *  Profile cover overlay           User choice moderate (0.06)
 *  Onboarding screens              Adinkra     moderate (0.06)
 *  Empty states                    Adinkra     prominent (0.10)
 *  Achievement / badge celebration Kente       prominent (0.10)
 *  Event detail header             Kente       subtle (0.03)
 *  Space detail header             Mudcloth    subtle (0.03)
 *  Opportunity detail header       Ndebele     subtle (0.03)
 *  Loading screen / spinner        Adinkra     moderate (0.06)
 *  Error pages (404 etc.)          Adinkra     moderate (0.06)
 */

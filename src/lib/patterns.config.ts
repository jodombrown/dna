/**
 * African-inspired geometric patterns for backgrounds and accents
 * 
 * Inspired by traditional African textiles:
 * - Kente: Bold geometric color blocking
 * - Ndebele: Angular modern shapes
 * - Mudcloth: Organic earth-tone patterns
 * - Adinkra: Symbolic geometric motifs
 * 
 * Usage: Apply subtle patterns as background texture, not overwhelming decoration
 */

export const PATTERNS = {
  // Kente-inspired: Bold geometric stripes and blocks
  kente: {
    subtle: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23F4A261' opacity='0.03'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23E76F51' opacity='0.03'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23E9C46A' opacity='0.03'/%3E%3Cpath d='M30 30h30v30H30z' fill='%23264653' opacity='0.03'/%3E%3C/svg%3E",
    medium: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23F4A261' opacity='0.05'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23E76F51' opacity='0.05'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23E9C46A' opacity='0.05'/%3E%3Cpath d='M30 30h30v30H30z' fill='%23264653' opacity='0.05'/%3E%3C/svg%3E",
    bold: "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h30v30H0z' fill='%23F4A261' opacity='0.08'/%3E%3Cpath d='M30 0h30v30H30z' fill='%23E76F51' opacity='0.08'/%3E%3Cpath d='M0 30h30v30H0z' fill='%23E9C46A' opacity='0.08'/%3E%3Cpath d='M30 30h30v30H30z' fill='%23264653' opacity='0.08'/%3E%3C/svg%3E",
  },
  
  // Ndebele-inspired: Angular geometric shapes
  ndebele: {
    subtle: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23E76F51' opacity='0.03'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23F4A261' opacity='0.03'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%23E9C46A' opacity='0.03'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%23264653' opacity='0.03'/%3E%3C/svg%3E",
    medium: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23E76F51' opacity='0.05'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23F4A261' opacity='0.05'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%23E9C46A' opacity='0.05'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%23264653' opacity='0.05'/%3E%3C/svg%3E",
    bold: "data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l20 20h-20z' fill='%23E76F51' opacity='0.08'/%3E%3Cpath d='M20 0l20 20h-20z' fill='%23F4A261' opacity='0.08'/%3E%3Cpath d='M40 0l20 20h-20z' fill='%23E9C46A' opacity='0.08'/%3E%3Cpath d='M60 0l20 20h-20z' fill='%23264653' opacity='0.08'/%3E%3C/svg%3E",
  },
  
  // Mudcloth-inspired: Organic dots and dashes
  mudcloth: {
    subtle: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1.5' fill='%23264653' opacity='0.03'/%3E%3Ccircle cx='30' cy='10' r='1.5' fill='%23264653' opacity='0.03'/%3E%3Ccircle cx='10' cy='30' r='1.5' fill='%23264653' opacity='0.03'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%23264653' opacity='0.03'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%23264653' stroke-width='1' opacity='0.03'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%23264653' stroke-width='1' opacity='0.03'/%3E%3C/svg%3E",
    medium: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='%23264653' opacity='0.05'/%3E%3Ccircle cx='30' cy='10' r='2' fill='%23264653' opacity='0.05'/%3E%3Ccircle cx='10' cy='30' r='2' fill='%23264653' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%23264653' opacity='0.05'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%23264653' stroke-width='1.5' opacity='0.05'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%23264653' stroke-width='1.5' opacity='0.05'/%3E%3C/svg%3E",
    bold: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2.5' fill='%23264653' opacity='0.08'/%3E%3Ccircle cx='30' cy='10' r='2.5' fill='%23264653' opacity='0.08'/%3E%3Ccircle cx='10' cy='30' r='2.5' fill='%23264653' opacity='0.08'/%3E%3Ccircle cx='30' cy='30' r='2.5' fill='%23264653' opacity='0.08'/%3E%3Cline x1='5' y1='20' x2='15' y2='20' stroke='%23264653' stroke-width='2' opacity='0.08'/%3E%3Cline x1='25' y1='20' x2='35' y2='20' stroke='%23264653' stroke-width='2' opacity='0.08'/%3E%3C/svg%3E",
  },
  
  // Adinkra-inspired: Symbolic geometric motifs (Sankofa simplified)
  adinkra: {
    subtle: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%23264653' stroke-width='0.5' opacity='0.03' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23E76F51' stroke-width='0.5' opacity='0.03' fill='none'/%3E%3C/svg%3E",
    medium: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%23264653' stroke-width='0.8' opacity='0.05' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23E76F51' stroke-width='0.8' opacity='0.05' fill='none'/%3E%3C/svg%3E",
    bold: "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 5v40M5 25h40M15 15l20 20M35 15l-20 20' stroke='%23264653' stroke-width='1.2' opacity='0.08' fill='none'/%3E%3Ccircle cx='25' cy='25' r='8' stroke='%23E76F51' stroke-width='1.2' opacity='0.08' fill='none'/%3E%3C/svg%3E",
  },
  
  // Diagonal stripes - versatile pattern
  stripes: {
    subtle: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 10l20-20M10 30l20-20M30 50l20-20' stroke='%23264653' stroke-width='1' opacity='0.03'/%3E%3C/svg%3E",
    medium: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 10l20-20M10 30l20-20M30 50l20-20' stroke='%23264653' stroke-width='1.5' opacity='0.05'/%3E%3C/svg%3E",
    bold: "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 10l20-20M10 30l20-20M30 50l20-20' stroke='%23264653' stroke-width='2' opacity='0.08'/%3E%3C/svg%3E",
  },
} as const;

/**
 * Helper function to apply pattern as inline style
 * @param pattern - Pattern name from PATTERNS
 * @param intensity - Pattern intensity (subtle, medium, bold)
 * @returns Inline style object for background
 */
export const applyPattern = (
  pattern: keyof typeof PATTERNS, 
  intensity: 'subtle' | 'medium' | 'bold' = 'subtle'
) => {
  return {
    backgroundImage: `url("${PATTERNS[pattern][intensity]}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto',
  };
};

/**
 * Pattern usage guidelines:
 * 
 * - Hero sections: kente (medium) or ndebele (subtle) for bold cultural presence
 * - Content cards: mudcloth (subtle) for organic texture
 * - Dashboard panels: adinkra (subtle) for symbolic meaning
 * - Footers/headers: stripes (subtle) for subtle structure
 * - Callout sections: kente (subtle) or ndebele (subtle) for emphasis
 * 
 * Best practices:
 * - Start with 'subtle' intensity - patterns should add texture, not distraction
 * - Use 'medium' for hero sections or special callouts
 * - Reserve 'bold' for major brand moments (landing hero, special announcements)
 * - Combine with gradient overlays for depth
 * - Test readability - content must remain legible
 */

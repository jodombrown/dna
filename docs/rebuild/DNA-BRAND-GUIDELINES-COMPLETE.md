# DNA Platform — Complete Brand & Design System Guidelines
## For Team Handoff & New App Recreation

> **Last extracted:** March 2026  
> **Source:** Live DNA codebase (`index.css`, `tailwind.config.ts`, `typography.config.ts`, `patterns.config.ts`, `cultural-colors.config.ts`, `animation.config.ts`)

---

## 1. TYPOGRAPHY SYSTEM

### Font Stack

| Alias | Font | CSS Class | Fallbacks | Role |
|-------|------|-----------|-----------|------|
| **Heritage** | **Lora** | `font-heritage` / `font-serif` | Georgia, Times New Roman, serif | Emotional weight — headings, stats, cultural moments |
| **UI** | **Inter** | `font-ui` / `font-sans` | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif | Functional clarity — body, buttons, nav, metadata |
| **Mono** | **JetBrains Mono** | `font-mono` | Fira Code, Consolas, monospace | Code blocks, technical content |

### Type Scale

| Token | Font | Size (mobile → desktop) | Weight | Line Height | Letter Spacing |
|-------|------|-------------------------|--------|-------------|----------------|
| `display` | Lora | 32px → 40px | Bold (700) | 1.2 | -0.02em |
| `h1` | Lora | 24px → 28px | Bold (700) | 1.3 | -0.01em |
| `h2` | Lora | 20px → 22px | SemiBold (600) | 1.3 | — |
| `h3` | Inter | 17px → 18px | SemiBold (600) | 1.4 | — |
| `h4` | Inter | 16px → 18px | SemiBold (600) | snug | — |
| `h5` | Inter | 14px → 16px | SemiBold (600) | normal | — |
| `h6` | Inter | 12px → 14px | SemiBold (600) | normal | — |
| `bodyLarge` | Inter | 16px → 17px | Regular (400) | 1.6 | — |
| `body` | Inter | 15px | Regular (400) | 1.55 | — |
| `bodySmall` | Inter | 13px → 14px | Regular (400) | 1.5 | — |
| `caption` | Inter | 12px | Regular (400) | 1.4 | 0.02em |
| `overline` | Inter | 11px | SemiBold (600) | 1.4 | 0.08em (uppercase) |
| `button` | Inter | 15px | SemiBold (600) | 1.2 | 0.01em |
| `input` | Inter | 16px mobile / 15px desktop | Regular (400) | 1.5 | — |
| `statLarge` | Lora | 30px → 36px | Bold (700) | — | — |
| `statMedium` | Lora | 24px → 30px | Bold (700) | — | — |
| `statSmall` | Lora | 20px → 24px | Bold (700) | — | — |

### Typography Rules

- **Lora** for: Display, H1, H2, profile names, DIA insight cards, onboarding, empty states, stat numbers, heritage generation badges
- **Inter** for: H3+, all body text, buttons, inputs, nav, metadata, captions, timestamps, overlines, notification headlines, tags/badges
- **CRITICAL**: Input `font-size` must be **16px on mobile** to prevent iOS Safari auto-zoom
- Max 2 fonts per screen
- Max line width: 65–75 characters
- Engagement numbers (likes, comments, views) use **Lora** for editorial weight

### Responsive Typography (Fluid Clamp Scale)

```css
.mobile-heading    { font-size: clamp(1.5rem, 5vw, 2.5rem); }
.mobile-subheading { font-size: clamp(1.125rem, 4vw, 1.875rem); }
.mobile-body       { font-size: clamp(0.875rem, 3vw, 1.125rem); }
.mobile-small      { font-size: clamp(0.75rem, 2.5vw, 0.875rem); }
```

---

## 2. COLOR PALETTE — Complete Token System

### 2.1 Foundation Colors (Light Mode)

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--background` | `34 33% 97%` | `#F9F7F4` | **Warm cream** — page background (NEVER cold white) |
| `--foreground` | `20 8% 15%` | `#3D3833` | Primary text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card surfaces on cream bg |
| `--card-foreground` | `20 8% 15%` | `#3D3833` | Card text |
| `--secondary` | `34 33% 94%` | Warm sand | Secondary backgrounds |
| `--muted` | `34 20% 94%` | — | Muted backgrounds |
| `--muted-foreground` | `25 7% 49%` | `#8A847D` | Warm gray secondary text |

### 2.2 Foundation Colors (Dark Mode)

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--background` | `0 0% 10%` | `#1A1A1A` | **Warm charcoal** (never blue-gray) |
| `--foreground` | `34 8% 94%` | `#F0EFED` | Light text |
| `--card` | `20 6% 13%` | `#262220` | Dark card surface |
| `--muted` | `20 6% 15%` | — | Muted dark surfaces |
| `--muted-foreground` | `25 7% 60%` | — | Dark mode secondary text |

### 2.3 Primary Brand — DNA Emerald

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--dna-emerald` | `153 31% 42%` | `#4A8D77` | **Hero brand color** — primary buttons, links, active states |
| `--dna-emerald-light` | `153 31% 54%` | `#6BAF98` | Hover state |
| `--dna-emerald-dark` | `153 31% 34%` | `#3A7262` | Active/pressed state |
| `--dna-emerald-subtle` | `153 31% 92%` | `#E8F2EE` | Background tint |

### 2.4 Five C's Module Colors

| Module | Token | HSL | Hex | Metaphor |
|--------|-------|-----|-----|----------|
| **CONNECT** | `--module-connect` | `153 31% 42%` | `#4A8D77` | Emerald — the network |
| **CONVENE** | `--module-convene` | `39 65% 47%` | `#C4942A` | Amber Gold — gathering warmth |
| **COLLABORATE** | `--module-collaborate` | `147 33% 27%` | `#2D5A3D` | Forest Green — growth, depth |
| **CONTRIBUTE** | `--module-contribute` | `25 51% 46%` | `#B87333` | Copper — value, exchange |
| **CONVEY** | `--module-convey` | `191 53% 35%` | `#2A7A8C` | Deep Teal — voice, expression |

Each module has `-light` and `-dark` variants (see full CSS above).

### 2.5 DIA (Diaspora Intelligence Agent) Colors

| Token | HSL | Usage |
|-------|-----|-------|
| `--dna-dia` | `39 65% 47%` | Gold — AI intelligence accent |
| `--dna-dia-light` | `39 50% 91%` | DIA background tint |
| `--dna-dia-glow` | `39 65% 60%` | DIA glow effect: `0 0 20px hsla(39, 65%, 47%, 0.15)` |

### 2.6 Warm Neutral Palette

| Token | HSL | Role |
|-------|-----|------|
| `--dna-cream` | `34 33% 97%` | Primary background |
| `--dna-sand` | `34 8% 94%` | Secondary background |
| `--dna-stone` | `28 10% 89%` | Borders, dividers |
| `--dna-gray400` | `25 7% 60%` | Placeholder text |
| `--dna-gray500` | `25 7% 52%` | Secondary text |
| `--dna-gray600` | `0 0% 40%` | Body text secondary |
| `--dna-gray800` | `20 8% 22%` | Primary text |
| `--dna-black` | `0 0% 10%` | Headings |

**Key insight:** All neutrals use warm brown/ochre undertones (`hue 20-34`), never cool blue-grays.

### 2.7 Cultural Accent Colors

| Token | HSL | Inspiration |
|-------|-----|-------------|
| `--dna-terra` | `18 60% 55%` | Terra cotta — African pottery |
| `--dna-ochre` | `38 70% 50%` | Golden earth — African landscapes |
| `--dna-sunset` | `25 85% 55%` | Vibrant warmth — African sunsets |
| `--dna-copper` | `25 51% 46%` | Value, exchange (CTA accent) |
| `--dna-gold` | `39 65% 47%` | Intelligence, warmth |
| `--dna-mint` | `170 45% 75%` | Freshness, growth |
| `--dna-crimson` | `0 70% 45%` | Warm red `#CC3333` (NOT cold red) |
| `--dna-earth` | `30 35% 45%` | Grounded, natural |
| `--dna-ocean` | `191 53% 35%` | Same as Convey teal |
| `--dna-forest` | `147 33% 27%` | Same as Collaborate green |

Each has `-light` and `-dark` variants.

### 2.8 Semantic Colors

| Token | HSL | Maps to |
|-------|-----|---------|
| `--dna-success` | `153 31% 42%` | Emerald (brand-aligned) |
| `--dna-warning` | `39 65% 47%` | Amber Gold |
| `--dna-error` | `0 70% 45%` | Warm Crimson `#CC3333` |
| `--dna-info` | `191 53% 35%` | Deep Teal |

### 2.9 Feed Card Bevel Colors

Each feed card type has a colored left border accent:

| Card Type | Token | HSL | Maps to |
|-----------|-------|-----|---------|
| Post | `--bevel-post` | `215 16% 47%` | Neutral slate |
| Story | `--bevel-story` | `191 53% 35%` | Convey teal |
| Event | `--bevel-event` | `39 65% 47%` | Convene amber |
| Space | `--bevel-space` | `147 33% 27%` | Collaborate forest |
| Opportunity | `--bevel-opportunity` | `25 51% 46%` | Contribute copper |

### 2.10 STRICTLY PROHIBITED COLORS

- ❌ **Purple** (`#8B5CF6`) — banned platform-wide
- ❌ **Cold white** (`#FFFFFF` as page background) — use warm cream `#F9F7F4`
- ❌ **Blue-gray** — use warm grays with brown undertones
- ❌ **LinkedIn blue** — DNA is emerald, not blue
- ❌ **Generic tech purple gradients**

---

## 3. ELEVATION / SHADOW SYSTEM

### Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-level0` | `none` | Flat elements |
| `--shadow-level1` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Cards at rest |
| `--shadow-level2` | `0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)` | Cards on hover |
| `--shadow-level3` | `0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.05)` | Dropdowns, popovers |
| `--shadow-level4` | `0 20px 25px rgba(0,0,0,0.06), 0 10px 10px rgba(0,0,0,0.04)` | Modals, dialogs |
| `--shadow-inner` | `inset 0 1px 2px rgba(0,0,0,0.06)` | Pressed inputs |
| `--shadow-focus` | `0 0 0 3px hsla(153, 31%, 42%, 0.2)` | **Emerald** focus ring (not blue) |
| `--shadow-glow` | `0 0 20px hsla(39, 65%, 47%, 0.15)` | DIA gold glow |

Tailwind classes: `shadow-dna-1` through `shadow-dna-4`, `shadow-dna-inner`, `shadow-dna-focus`, `shadow-dna-glow`

### Dark Mode (stronger)

Shadows use `rgba(0,0,0,0.2-0.3)` instead of `0.04-0.06`.

---

## 4. BORDER RADIUS SYSTEM

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| `--radius-sm` | `6px` | `rounded-dna-sm` |
| `--radius-md` | `10px` | `rounded-dna-md` |
| `--radius-lg` | `12px` | `rounded-dna-lg` |
| `--radius-xl` | `16px` | `rounded-dna-xl` |
| `--radius-full` | `9999px` | `rounded-full` |
| `--radius` (default) | `0.75rem` (12px) | `rounded-lg` |

**Standard card radius:** `rounded-xl` (≈12-16px)

---

## 5. CARD & SURFACE DESIGN

### Card Tokens

```css
--card-radius: 12px;
--card-padding: 16px;
--card-shadow: var(--shadow-level1);
--card-shadow-hover: var(--shadow-level2);
--bevel-width: 3px;
```

### Feed Card Architecture

Each feed card uses `FeedCardBase` with:
- `bg-card rounded-xl border-2 p-5`
- Border color set by `bevelType` (post/story/event/space/opportunity)
- Hover: `shadow-[0_2px_8px_rgba(0,0,0,0.10)]` + `hover:-translate-y-0.5`
- Transition: `transition-all duration-200`

### Glass Morphism Panels

```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(12px);
```

Used in: header bars, overlays, pulse bar.

---

## 6. HERITAGE PATTERN SYSTEM — DNA's Cultural Soul

### Four Patterns

| Pattern | Origin | Visual | Color Palette |
|---------|--------|--------|---------------|
| **Kente** | Ghana / Ashanti | Interlocking geometric grid (30×30 squares) | Amber `#C4942A`, Copper `#B87333`, Gold `#D4A843`, Emerald `#4A8D77` |
| **Ndebele** | South Africa | Bold triangular geometric shapes | Copper, Amber, Emerald, Forest `#2D5A3D` |
| **Mudcloth** | Mali / West Africa | Earthy dots and dashes | Forest Green `#2D5A3D` monochrome |
| **Adinkra** | Ghana / Akan | Philosophical symbols (crosshair + circle = Sankofa) | Emerald `#4A8D77` + Amber `#C4942A` |

### Opacity Levels (4 tiers)

| Intensity | Opacity | Usage |
|-----------|---------|-------|
| `subtle` | 0.03 (3%) | Page backgrounds, large areas |
| `moderate` | 0.06 (6%) | Section accents, headers |
| `prominent` | 0.10 (10%) | Featured moments, celebrations, empty states |
| `decorative` | 0.15 (15%) | Badges, smallest areas only |

### Pattern Application Map

| Location | Pattern | Intensity |
|----------|---------|-----------|
| Feed background (behind cards) | Mudcloth | subtle |
| Profile cover overlay | User's choice | moderate |
| Onboarding screens | Adinkra | moderate |
| Empty states | Adinkra | prominent |
| Achievement celebrations | Kente | prominent |
| Event detail header | Kente | subtle |
| Space detail header | Mudcloth | subtle |
| Opportunity detail header | Ndebele | subtle |
| Loading screen / spinner | Adinkra | moderate |
| Error pages (404) | Adinkra | moderate |
| Connect/Convene Hubs | Kente | subtle/moderate |
| DIA insight cards | Adinkra | moderate (wisdom) |
| Management consoles | Mudcloth | subtle |
| Conversation headers | Ndebele | subtle |

### Implementation

Patterns are **inline SVG data URIs** applied as repeating backgrounds:

```tsx
import { PATTERNS, applyPattern } from '@/lib/patterns.config';

// Via helper function
<div style={applyPattern('kente', 'subtle')} />

// Via PatternBackground component
<PatternBackground pattern="adinkra" intensity="prominent" overlay>
  {children}
</PatternBackground>
```

### Why This Matters (The Soul Question)

> **"What makes DNA unmistakably diaspora and not just a generic editorial product?"**

The heritage pattern system is the answer. These four African geometric traditions — Kente (unity), Ndebele (identity), Mudcloth (knowledge), Adinkra (philosophy) — are woven into every surface at near-subliminal opacity. Users don't consciously see patterns; they **feel** warmth, belonging, and cultural grounding. Combined with the warm cream foundation (never cold white), copper/emerald/gold palette (never tech-blue), and Lora serif for emotional weight, every pixel communicates: *this was built by us, for us*.

No other platform has ancestral geometry as a design primitive.

---

## 7. ANIMATION SYSTEM

### Duration Tokens (Only 3 allowed)

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | 100ms | Micro-interactions (checkbox, switch) |
| `normal` | 150ms | Default (hover, focus, button press) |
| `slow` | 300ms | Page transitions, modals, sheets |

### Standard Animation Patterns

```css
/* Card hover */
.card: transition-all duration-150 hover:shadow-md active:scale-[0.98]

/* Button hover + active */
.button: transition-all duration-150 hover:opacity-90 active:scale-95

/* Link hover */
.link: transition-colors duration-150 hover:text-dna-emerald

/* Icon button */
.iconButton: transition-all duration-150 hover:bg-gray-100 active:scale-95
```

### Keyframe Animations

| Name | Duration | Purpose |
|------|----------|---------|
| `fade-in` | 300ms ease-out | Page load, content reveal (translateY 10px → 0) |
| `breathing-pulse` | 5s ease-in-out infinite | Interactive elements breathing |
| `heartbeat` | 2s ease-in-out infinite | Emphasis elements |
| `badge-glow` | 4s ease-in-out infinite | Achievement badges |
| `image-heartbeat` | 2.5s ease-in-out infinite | Featured images |
| `float` | 3s ease-in-out infinite | Decorative floating |
| `shimmer` | 1.5s ease-in-out infinite | Skeleton loading (sand-colored) |
| `kente-flow` | 8s ease-in-out infinite | Heritage pattern drift |
| `slide-up` | 250ms ease-out | Mobile bottom nav entry |
| `slide-down` | 200ms ease-in | Mobile bottom nav exit |
| `bokeh-drift-1..4` | 15-20s linear infinite | Auth page ambient bokeh |

### Skeleton Loader (DNA-branded)

```css
.animate-shimmer {
  background: linear-gradient(90deg,
    hsl(var(--dna-sand)) 0%,
    hsl(var(--dna-cream)) 40%,
    hsl(var(--dna-sand)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

Uses sand/cream colors instead of generic gray shimmer.

### Reduced Motion

All heavy animations disabled when `prefers-reduced-motion: reduce`.

---

## 8. LAYOUT PATTERNS

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `xs` | 375px | Small phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

### Container

```css
container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } }
```

### Fixed Navigation Stack (Desktop)

```
┌─────────────────────────────────┐  fixed z-50, h-16 (64px)
│         UnifiedHeader           │
├─────────────────────────────────┤  fixed z-40, top-16
│          PulseBar               │  (desktop + auth only, h-12)
├─────────────────────────────────┤
│                                 │  pt-14 sm:pt-16 lg:pt-[7.5rem]
│         Page Content            │  (120px clearance on desktop)
│         max-w-7xl mx-auto       │
│                                 │
├─────────────────────────────────┤
│  PulseDock (mobile bottom nav)  │  pb-20 on mobile
└─────────────────────────────────┘
```

### Mobile Utilities

```css
.pb-bottom-nav { padding-bottom: calc(4rem + env(safe-area-inset-bottom)); }
.safe-area-pb  { padding-bottom: max(env(safe-area-inset-bottom), 0.5rem); }

/* Touch targets */
.touch-target    { min-h-[48px] min-w-[48px] }
.touch-target-sm { min-h-[40px] min-w-[40px] }
.touch-target-lg { min-h-[56px] min-w-[56px] }

/* Mobile interaction */
.mobile-interactive:active { scale: 0.95 }
.mobile-card:active { scale: 0.98 }
```

### Grid System

```css
.mobile-grid   { grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 }
.mobile-grid-2 { grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 }
.mobile-grid-4 { grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 }
```

---

## 9. INTERACTIVE ELEMENTS

### Focus States

```css
/* Keyboard-only focus ring — Emerald, not blue */
*:focus-visible {
  outline: 2px solid hsl(var(--dna-emerald));
  outline-offset: 2px;
}

/* Shadow-based focus */
--shadow-focus: 0 0 0 3px hsla(153, 31%, 42%, 0.2);
```

### Button System (via shadcn variants)

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| Primary | DNA Emerald | White | Main CTAs |
| Secondary | Warm Sand | Dark text | Secondary actions |
| Accent | DNA Copper | White | Special CTAs ("Join Now") |
| Destructive | Warm Crimson | White | Delete, remove |
| Ghost | Transparent | Current color | Toolbar buttons |
| Outline | Transparent + border | Emerald | Alternative CTAs |

### Hover Transitions

All interactive elements: `transition-all duration-200` (or `duration-150` per animation system).

---

## 10. AUTH PAGE DESIGN

### Split-Screen Layout
- **Left panel** (desktop): Dark branded panel with animated bokeh drifts (4 orbs, 15-20s cycles), heritage pattern overlay, DNA logo
- **Right panel**: Clean white card with auth form

### Key Elements
- DNA multicolor double-helix logo at `h-36`
- "Diaspora Network of Africa" always on single line (`whitespace-nowrap`)
- Sign In / Sign Up toggle: active state = `bg-primary text-white`
- Feature pills with Lucide icons (Globe, Users, Rocket) — **no emojis**
- Fixed "Back" button for navigation

---

## 11. WHAT DNA DESIGN IS / IS NOT

### ✅ DNA IS:
- **Warm** — cream backgrounds, copper/gold accents, brown-undertone neutrals
- **Pan-African** — heritage patterns, cultural color stories, Lora serif for gravitas
- **Editorial** — like a premium magazine, professional density, not social-media sparse
- **Living** — subtle breathing animations, heritage pattern drifts, ambient motion
- **Grounded** — earth tones, forest greens, warm reds — colors from the land

### ❌ DNA IS NOT:
- **LinkedIn** — no blue, no corporate sterility, no rectangular thin-bordered cards
- **Generic SaaS** — no purple gradients, no Inter-only typography, no cold whites
- **Social media casual** — not Facebook-sparse or TikTok-playful
- **Tokenized African** — patterns are subtle (3-10% opacity), never costume or decoration
- **Tech-default** — no Inter+Poppins, no purple-on-white, no gradient hero sections

---

## 12. LOGO USAGE

- **Asset**: `src/assets/dna-logo.png` — graphic mark (double-helix inspired)
- **Header size**: `h-[60px] md:h-[80px]` in `UnifiedHeader`
- **Auth page size**: `h-36` (144px)
- **No wordmark** in the header — logo is standalone
- **Always links to** `/` via `NavLink`
- **Tagline** (when shown): *"The Operating System for the Global African Diaspora"*

---

## 13. BRAND PILLARS

| Pillar | Meaning |
|--------|---------|
| **Warm** | Every surface radiates warmth — cream, copper, gold, earth |
| **Rooted** | Heritage patterns ground every interaction in ancestral geometry |
| **Empowering** | The Five C's create a cyclical value system, not passive consumption |
| **Modern** | Inter for functional UI, clean shadows, professional density |

### Tone Guidelines
- Use "Welcome home" — belonging, not tourism
- Cultural authenticity without reductive framing
- Professional but never cold
- Pan-African — inclusive of continent AND diaspora
- **"Agent" not "Assistant"** — DIA is intelligent, proactive, autonomous

---

## 14. QUICK-START TOKEN REFERENCE

```css
/* Copy-paste starter for new project */
:root {
  /* Foundations */
  --background: 34 33% 97%;    /* Warm cream */
  --foreground: 20 8% 15%;     /* Warm black */
  --card: 0 0% 100%;
  
  /* Brand */
  --primary: 153 31% 42%;      /* DNA Emerald #4A8D77 */
  --accent: 25 51% 46%;        /* DNA Copper #B87333 */
  
  /* Five C's */
  --module-connect: 153 31% 42%;     /* Emerald */
  --module-convene: 39 65% 47%;      /* Amber Gold */
  --module-collaborate: 147 33% 27%; /* Forest Green */
  --module-contribute: 25 51% 46%;   /* Copper */
  --module-convey: 191 53% 35%;      /* Deep Teal */
  
  /* DIA */
  --dna-dia: 39 65% 47%;      /* Gold */
  
  /* Neutrals (warm) */
  --dna-cream: 34 33% 97%;
  --dna-stone: 28 10% 89%;
  --border: 28 10% 89%;
  --ring: 153 31% 42%;
  
  /* Elevation */
  --shadow-level1: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-focus: 0 0 0 3px hsla(153, 31%, 42%, 0.2);
  --shadow-glow: 0 0 20px hsla(39, 65%, 47%, 0.15);
  
  /* Geometry */
  --radius: 0.75rem;
  --card-radius: 12px;
  --card-padding: 16px;
}

.dark {
  --background: 0 0% 10%;     /* Warm charcoal */
  --foreground: 34 8% 94%;
  --card: 20 6% 13%;
  --border: 20 6% 28%;
}
```

### Font Loading

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Tailwind Font Config

```typescript
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  serif: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
  heritage: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
  ui: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
}
```

---

*This document is the definitive DNA brand reference. Every color is HSL, every token is semantic, every pattern has cultural provenance. When your team asks "why not just use white?" — point them to Section 6.*

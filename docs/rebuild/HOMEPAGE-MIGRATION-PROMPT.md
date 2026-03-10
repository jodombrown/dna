# DNA Homepage Migration Prompt

**Copy everything below this line and paste it into the other project's chat.**

---

## PROMPT START

I need you to rebuild the complete DNA (Diaspora Network of Africa) homepage from my other project. This is a marketing landing page for a diaspora professional networking platform. Read the source files from the other project called "Diaspora Network of Africa" (the "Website" one) to get the exact code, then recreate each component in this project.

### IMPORTANT: Read from the source project first

Use `cross_project` tools to read from the project named "Diaspora Network of Africa" (project slug: `diaspora-network-of-africa`). Read these files to get the exact source code:

**Step 1: Design System Foundation** — Read and recreate these first:
- `src/index.css` (full file — contains all CSS variables: DNA brand colors, shadows, tokens)
- `tailwind.config.ts` (full file — contains all custom colors, fonts, animations, keyframes)
- `src/lib/typography.config.ts` — Typography token system (Lora/Inter)
- `src/lib/patterns.config.ts` — Heritage pattern SVG data (Kente, Ndebele, Mudcloth, Adinkra)
- `src/lib/config.ts` — App config (URLs, social links, emails)
- `src/lib/utils.ts` — cn() utility

**Step 2: Shared UI Components** — Read and recreate:
- `src/components/ui/PatternBackground.tsx` — Heritage pattern wrapper component
- `src/components/platform/SwipeableCardStack.tsx` — Swipeable card stack with touch/mouse drag

**Step 3: SEO** — Read and recreate:
- `src/components/seo/PageSEO.tsx` — SEO component with JSON-LD schema generators

**Step 4: Stats Components** — Read and recreate:
- `src/hooks/useAnimatedCounter.ts` — Animated number counter hook
- `src/components/stats/AnimatedStatsSection.tsx` — Animated stats with 3 cards ($100B+, 200M+, 43%)
- `src/components/stats/InteractiveTimeline.tsx` — Timeline component (2014-2026)
- `src/components/stats/timeline/timelineData.ts` — Timeline data with 7 years of diaspora milestones
- `src/components/stats/timeline/TimelineItem.tsx` — Individual timeline card
- `src/components/stats/timeline/TimelineDialog.tsx` — Dialog for expanded timeline content
- `src/components/stats/TestimonialsCarousel.tsx` (renders null — placeholder)
- `src/components/stats/CallToActionSection.tsx` (renders null — placeholder)
- `src/components/DiasporaStats.tsx` — Wrapper that composes all stats components

**Step 5: Five C's Platform Sections** — Read and recreate:
- `src/components/platform/HeroTriangleSection.tsx` — DNA Framework overview with 5 navigation cards
- `src/components/platform/ConnectSection.tsx` — Connect pillar with professional profile cards
- `src/components/platform/ConveneSection.tsx` — Convene pillar with event cards
- `src/components/platform/CollaborateSection.tsx` — Collaborate pillar with project cards
- `src/components/platform/ContributeSection.tsx` — Contribute pillar with contribution cards
- `src/components/platform/ConveySection.tsx` — Convey pillar with story cards
- `src/components/PlatformFeatureShowcase.tsx` — Wrapper for all Five C's sections

**Step 6: Page-Level Components** — Read and recreate:
- `src/components/HeroSection.tsx` — Hero with headline, CTA buttons, hero image, and stats
- `src/components/BuildingTogetherSection.tsx` — Three action cards (Feedback, Progress, Learn)
- `src/components/WhoIsDNAForSection.tsx` — FAQ accordion + final CTA
- `src/components/Footer.tsx` — Minimal footer with LinkedIn link

**Step 7: Waitlist Popup** — Read and recreate:
- `src/hooks/useWaitlistPopup.ts` — Scroll-triggered waitlist popup hook
- `src/components/waitlist/WaitlistPopup.tsx` — Waitlist signup modal (uses Supabase)

**Step 8: Main Page** — Read and recreate:
- `src/pages/Index.tsx` — Main page composing all sections with lazy loading

### Key Assets Needed
- `src/assets/hero-professional.jpeg` — Hero image (copy with cross_project asset tools)

### Required Dependencies
Ensure these are installed: `framer-motion`, `lucide-react`, `react-helmet-async`, `react-router-dom`, `@supabase/supabase-js`

### Architecture Notes
- The page uses `React.lazy()` for below-the-fold sections
- Each Five C's section alternates layout (text-left/card-right, then card-left/text-right)
- SwipeableCardStack provides a cascading card UI with swipe/drag gestures
- Heritage patterns (Kente, Mudcloth) are applied as subtle SVG backgrounds
- Typography uses two fonts: Lora (serif/heritage) for headings, Inter (sans) for UI
- Colors use HSL-based CSS custom properties via Tailwind tokens
- The waitlist popup triggers when user scrolls past 50% of the Connect section

### Design System Color Summary (HSL values for index.css)
```
--background: 34 33% 97%          (warm cream)
--primary: 153 31% 42%            (DNA Emerald #4A8D77)
--dna-forest: 147 33% 27%         (deep green)
--dna-copper: 25 51% 46%          (warm copper)
--dna-gold: 39 65% 47%            (amber gold)
--dna-ochre: 38 70% 50%           (ochre)
--dna-terra: 18 60% 55%           (terra cotta)
--dna-sunset: 25 85% 55%          (sunset orange)
--dna-mint: 170 45% 75%           (mint)
```

### Font Loading
Add to `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

Build all components step by step, starting with the design system foundation, then shared components, then page sections. Make sure all the CSS variables, Tailwind config, and component code exactly match the source project.

## PROMPT END

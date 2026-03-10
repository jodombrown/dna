# DNA Homepage — Complete Extraction Bundle

> **Purpose**: Self-contained reference for rebuilding the DNA homepage in a new Lovable project.
> **Generated**: 2026-03-10

---

## 📁 FILE MANIFEST

### Page Entry Point
- `src/pages/Index.tsx` — Main homepage route

### Core Components (in render order)
1. `src/components/HeroSection.tsx` — Hero with auth buttons + DiasporaStats
2. `src/components/DiasporaStats.tsx` — Stats wrapper (AnimatedStats, Timeline, Testimonials, CTA)
3. `src/components/PlatformFeatureShowcase.tsx` — Five C's showcase wrapper
4. `src/components/BuildingTogetherSection.tsx` — Feedback/Progress/Learn cards
5. `src/components/WhoIsDNAForSection.tsx` — FAQ accordion + final CTA
6. `src/components/Footer.tsx` — Minimal footer

### Platform Sections (Five C's)
- `src/components/platform/HeroTriangleSection.tsx` — DNA Framework intro + 5 nav cards
- `src/components/platform/ConnectSection.tsx` — Connect pillar showcase
- `src/components/platform/ConveneSection.tsx` — Convene pillar showcase
- `src/components/platform/CollaborateSection.tsx` — Collaborate pillar showcase
- `src/components/platform/ContributeSection.tsx` — Contribute pillar showcase
- `src/components/platform/ConveySection.tsx` — Convey pillar showcase
- `src/components/platform/SwipeableCardStack.tsx` — Shared swipeable card component

### Stats Components
- `src/components/stats/AnimatedStatsSection.tsx` — 3 animated stat cards
- `src/components/stats/InteractiveTimeline.tsx` — Horizontal scrollable timeline (2014-2026)
- `src/components/stats/TestimonialsCarousel.tsx` — (returns null — placeholder)
- `src/components/stats/CallToActionSection.tsx` — (returns null — placeholder)
- `src/components/stats/timeline/TimelineItem.tsx` — Single timeline card
- `src/components/stats/timeline/TimelineDialog.tsx` — Timeline detail modal
- `src/components/stats/timeline/timelineData.ts` — All timeline data with sources

### Waitlist Components
- `src/components/waitlist/WaitlistPopup.tsx` — Scroll-triggered waitlist form (uses Supabase)

### UI Primitives
- `src/components/ui/PatternBackground.tsx` — African heritage pattern wrapper

### SEO
- `src/components/seo/PageSEO.tsx` — Full SEO component with structured data helpers

### Hooks
- `src/hooks/useScrollToTop.ts` — Scroll restoration on navigation
- `src/hooks/useWaitlistPopup.ts` — Scroll-triggered popup logic
- `src/hooks/useAnimatedCounter.ts` — IntersectionObserver + animated number counter

### Config / Lib
- `src/lib/patterns.config.ts` — Kente, Ndebele, Mudcloth, Adinkra SVG patterns
- `src/lib/typography.config.ts` — TYPOGRAPHY token system (Lora + Inter)
- `src/lib/config.ts` — App URLs, Supabase config, social links, emails

### Assets
- `src/assets/hero-professional.jpeg` — Hero image
- `src/assets/dna-logo.png` — Logo
- `src/assets/dna-logo-optimized.webp` — Logo (WebP)

### Dependencies Used
- `react-helmet-async` — SEO/meta tags
- `framer-motion` — Animations (used in ManifestoCTA, other pages)
- `lucide-react` — Icons throughout
- `react-router-dom` — Navigation
- `@radix-ui/*` — Dialog, Avatar, Badge, Progress, etc.
- `tailwindcss` — Styling

---

## 🎨 DESIGN TOKENS (Tailwind Colors Used)

```
dna-emerald     #4A8D77    Primary brand / Connect
dna-forest      #2D5A3D    Dark green / text headers
dna-copper      #B87333    Warm accent / Collaborate
dna-gold        #C4942A    Gold accent / Contribute
dna-ochre       #D4A843    Warm gold
dna-sunset      (gradient)  Convene accent
dna-mint        (light green) Stats accent
dna-terra       (earth tone) Background accents
dna-pearl-light (cream)     Soft backgrounds
```

---

## 📄 FULL COMPONENT SOURCE CODE

### 1. `src/pages/Index.tsx`

```tsx
import React, { useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

import HeroSection from '@/components/HeroSection';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useAuth } from '@/contexts/AuthContext';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';
import { PageSEO, getOrganizationSchema, getWebsiteSchema } from '@/components/seo/PageSEO';

const PlatformFeatureShowcase = lazy(() => import('@/components/PlatformFeatureShowcase'));
const BuildingTogetherSection = lazy(() => import('@/components/BuildingTogetherSection'));
const WhoIsDNAForSection = lazy(() => import('@/components/WhoIsDNAForSection'));
const Footer = lazy(() => import('@/components/Footer'));
const WaitlistPopup = lazy(() => import('@/components/waitlist/WaitlistPopup'));

const SectionFallback = () => <div className="min-h-[200px]" />;

const Index = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dna/feed');
    }
  }, [user, loading, navigate]);

  const structuredData = [getOrganizationSchema(), getWebsiteSchema()];

  return (
    <div className="min-h-screen bg-white">
      <PageSEO
        title="DNA: Connect the African Diaspora to Drive Africa's Growth"
        description="Join 200M+ diaspora members on DNA, the platform for African professionals to connect, collaborate, and contribute to Africa's economic transformation."
        keywords={[
          'african diaspora platform',
          'diaspora networking',
          'africa investment',
          'african professionals network',
          'pan-african community',
          'diaspora collaboration',
          'africa economic development',
          'african entrepreneurs',
        ]}
        canonicalPath="/"
        structuredData={structuredData}
      />
      <HeroSection />
      <Suspense fallback={<SectionFallback />}>
        <PlatformFeatureShowcase />
        <BuildingTogetherSection />
        <WhoIsDNAForSection />
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <WaitlistPopup 
          isOpen={showWaitlistPopup}
          onClose={closeWaitlistPopup}
        />
      </Suspense>
    </div>
  );
};

export default Index;
```

### 2. `src/components/HeroSection.tsx`

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DiasporaStats from '@/components/DiasporaStats';
import { TYPOGRAPHY } from '@/lib/typography.config';
import PatternBackground from '@/components/ui/PatternBackground';
import heroProfessional from '@/assets/hero-professional.jpeg';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <PatternBackground pattern="kente" intensity="subtle" className="relative bg-gradient-to-br from-dna-terra-light/20 via-white to-dna-ochre-light/10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center min-h-[60vh] py-8 lg:py-12">
            <div className="space-y-4 lg:space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-serif text-dna-forest mb-4 lg:mb-6 leading-[1.1] lg:leading-[1.05]">
                  Welcome to the
                  <br />
                  <span className="text-dna-copper">Diaspora Network of Africa</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-muted-foreground mb-2 lg:mb-3 leading-relaxed">
                  Where the African diaspora goes from scattered potential to coordinated power.
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-dna-forest/80 font-medium mb-3 lg:mb-4">
                  One platform. Five ways to move Africa forward.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start mb-4 lg:mb-6">
                  <Button 
                    variant="outline" size="lg" 
                    onClick={() => navigate('/auth')}
                    className="border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white text-base lg:text-xl px-6 lg:px-10 py-3 lg:py-6 h-auto font-medium"
                  >
                    Sign in
                  </Button>
                  <Button 
                    variant="outline" size="lg" 
                    onClick={() => navigate('/auth?mode=signup')}
                    className="border-2 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white text-base lg:text-xl px-6 lg:px-10 py-3 lg:py-6 h-auto font-medium"
                  >
                    Join Now
                  </Button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 text-center lg:text-left leading-relaxed">
                  By clicking Continue to join or sign in, you agree to DNA's{' '}
                  <a href="/legal/user-agreement" className="text-dna-copper hover:underline font-medium">User Agreement</a>,{' '}
                  <a href="/legal/privacy-policy" className="text-dna-copper hover:underline font-medium">Privacy Policy</a>,{' '}
                  <a href="/legal/terms" className="text-dna-copper hover:underline font-medium">Terms & Conditions</a>, and{' '}
                  <a href="/legal/cookie-policy" className="text-dna-copper hover:underline font-medium">Cookie Policy</a>.
                </p>
              </div>
            </div>
            <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
                <img 
                  src={heroProfessional} 
                  alt="African diaspora professionals collaborating and working together" 
                  className="w-full h-full object-cover"
                  width={800} height={600} loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-sunset/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-terra/10 rounded-full blur-3xl"></div>
        </div>
      </PatternBackground>
      <PatternBackground pattern="mudcloth" intensity="subtle" className="py-10 bg-gradient-to-r from-dna-terra/10 to-dna-sunset/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
        </div>
      </PatternBackground>
    </>
  );
};

export default HeroSection;
```

### 3. `src/components/DiasporaStats.tsx`

```tsx
import React from 'react';
import AnimatedStatsSection from './stats/AnimatedStatsSection';
import InteractiveTimeline from './stats/InteractiveTimeline';
import TestimonialsCarousel from './stats/TestimonialsCarousel';
import CallToActionSection from './stats/CallToActionSection';

const DiasporaStats = () => {
  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <AnimatedStatsSection />
      </div>
      <InteractiveTimeline />
      <div className="max-w-7xl mx-auto">
        <TestimonialsCarousel />
      </div>
      <div className="max-w-7xl mx-auto">
        <CallToActionSection />
      </div>
    </div>
  );
};

export default DiasporaStats;
```

### 4. `src/components/stats/AnimatedStatsSection.tsx`

```tsx
import React from 'react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

const AnimatedStat = ({ value, suffix, label, description, bgGradient, source, sourceUrl }: {
  value: number; suffix: string; label: string; description: string;
  bgGradient: string; source?: string; sourceUrl?: string;
}) => {
  const { count, countRef } = useAnimatedCounter({ end: value, duration: 2500 });
  return (
    <div className={`${bgGradient} rounded-xl p-6 text-center shadow-lg min-h-[140px]`}>
      <div ref={countRef} className="text-4xl font-bold text-white mb-2 tabular-nums min-w-[120px] inline-block h-[44px]">
        {count}{suffix}
      </div>
      <div className="text-lg font-medium text-white/90 mb-1 h-[28px]">{label}</div>
      <div className="text-sm text-white/80 min-h-[40px]">{description}</div>
      {source && (
        <div className="mt-3 pt-2 border-t border-white/20">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white/90 underline underline-offset-2 transition-colors">
              Source: {source}
            </a>
          ) : (
            <span className="text-xs text-white/60">Source: {source}</span>
          )}
        </div>
      )}
    </div>
  );
};

const AnimatedStatsSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper rounded-3xl overflow-hidden mb-16">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 px-8 py-16 text-center text-white">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-12 leading-tight">
          The African Diaspora: A $100 B+ Engine for Change
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <AnimatedStat value={200} suffix="M+" label="People of African Descent"
            description="Living outside Africa, projected to comprise 25% of global population"
            bgGradient="bg-gradient-to-br from-dna-emerald/80 to-dna-forest/80"
            source="African Union, 2024" sourceUrl="https://au.int/en/diaspora" />
          <AnimatedStat value={100} suffix="B+" label="Annual Remittances (2024)"
            description="Fueling economic growth across African nations"
            bgGradient="bg-gradient-to-br from-dna-copper/80 to-dna-gold/80"
            source="World Bank / KNOMAD, 2024" sourceUrl="https://www.knomad.org/publication/migration-and-development-brief-41" />
          <AnimatedStat value={43} suffix="%" label="Highly Educated"
            description="Hold bachelor's degree or higher, 2x the U.S. national average"
            bgGradient="bg-gradient-to-br from-dna-mint/80 to-dna-emerald/80"
            source="Pew Research Center, 2022" sourceUrl="https://www.pewresearch.org/global/fact-sheet/sub-saharan-african-immigrants-in-the-u-s/" />
        </div>
      </div>
    </section>
  );
};

export default AnimatedStatsSection;
```

### 5. `src/hooks/useAnimatedCounter.ts`

```tsx
import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterProps {
  end: number; duration?: number; decimals?: number; resetKey?: string;
}

export const useAnimatedCounter = ({ end, duration = 2000, decimals = 0, resetKey }: UseAnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (resetKey) { hasAnimated.current = false; setIsVisible(false); setCount(0); }
  }, [resetKey]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) { setIsVisible(true); hasAnimated.current = true; }
    }, { threshold: 0.1, rootMargin: '50px' });
    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [resetKey]);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Number((end * easeOutCubic).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, decimals]);

  return { count, countRef };
};
```

### 6. `src/components/stats/InteractiveTimeline.tsx` + Timeline sub-components

*(See timelineData.ts below for the complete 7-year dataset with sources)*

```tsx
// InteractiveTimeline.tsx — Horizontal scrollable timeline with dialog
// TimelineItem.tsx — Individual year card with click-to-expand
// TimelineDialog.tsx — Modal showing expanded content + sources + navigation
// timelineData.ts — 7 entries (2014, 2016, 2018, 2020, 2022, 2024, 2026)
```

**Timeline Data highlights:**
- 2014: Remittances $33B, digital banking emergence
- 2016: $38B, mobile money expansion, 100+ orgs
- 2018: $46B, tech startup boom, 250+ orgs
- 2020: $44B, COVID resilience, virtual tools
- 2022: $53B, fintech revolution, 1000+ projects
- 2024: $100B+, return migration, AI platforms
- 2026: Coordination era, beyond remittances

### 7. `src/lib/patterns.config.ts`

```typescript
// African-inspired geometric patterns: kente, ndebele, mudcloth, adinkra
// Each has 4 intensity levels: subtle (0.03), moderate (0.06), prominent (0.10), decorative (0.15)
// Encoded as inline SVG data URIs
// See full file for complete SVG data
```

### 8. `src/lib/typography.config.ts`

```typescript
export const TYPOGRAPHY = {
  display: 'font-heritage text-[32px] md:text-[40px] font-bold leading-[1.2] tracking-[-0.02em]',
  h1: 'font-heritage text-[24px] md:text-[28px] font-bold leading-[1.3] tracking-[-0.01em]',
  h2: 'font-heritage text-[20px] md:text-[22px] font-semibold leading-[1.3]',
  h3: 'font-ui text-[17px] md:text-[18px] font-semibold leading-[1.4]',
  // ... h4-h6, body variants, caption, overline, button, input, stat sizes
} as const;
```

### 9. `src/components/ui/PatternBackground.tsx`

```tsx
// Wraps children with African heritage SVG pattern background
// Props: pattern (kente|ndebele|mudcloth|adinkra), intensity, className, overlay
```

### 10. `src/components/platform/SwipeableCardStack.tsx`

```tsx
// Touch/mouse swipeable card stack with cascading layout
// Props: cards (ReactNode[]), onCardClick
// Features: drag offset, touch/mouse events, indicator dots, prev/next buttons
```

### 11. Five C's Sections (Connect, Convene, Collaborate, Contribute, Convey)

Each section follows the same pattern:
- **Layout**: Alternating text-left/cards-right and cards-left/text-right
- **Text side**: Icon + H2 title, subtitle, description, 3 feature bullets, CTA button
- **Cards side**: SwipeableCardStack with 5 demo cards
- **Each card**: Gradient header, content body, action button, breadcrumb hint

### 12. Supporting Components

- **BuildingTogetherSection**: 3 action cards (Share Feedback, Track Progress, Learn About DNA) with Mudcloth pattern
- **WhoIsDNAForSection**: 5 FAQ accordion items + final CTA card
- **Footer**: Copyright, documentation link, LinkedIn social link

### 13. `src/lib/config.ts`

```typescript
export const config = {
  APP_URL: 'https://diasporanetwork.africa',
  APP_DOMAIN: 'diasporanetwork.africa',
  SUPABASE_URL: '...',
  SUPABASE_ANON_KEY: '...',
  social: { linkedin: '...', twitter: '...' },
  emails: { support: 'aweh@diasporanetwork.africa', ... },
};
```

### 14. `src/components/seo/PageSEO.tsx`

Full SEO component with:
- `PageSEO` — Title, meta, OG, Twitter, canonical, structured data
- `getOrganizationSchema()` — Organization JSON-LD
- `getWebsiteSchema()` — WebSite JSON-LD with SearchAction
- `getBreadcrumbSchema()` — BreadcrumbList
- `getEventSchema()` — Event
- `getArticleSchema()` — Article

---

## 🔗 EXTERNAL DEPENDENCIES NEEDED

```
react-helmet-async    # SEO meta tags
lucide-react          # Icons
framer-motion         # Animations (used sparingly on homepage)
react-router-dom      # Navigation
@radix-ui/react-dialog  # Timeline dialog
@radix-ui/react-avatar  # Profile avatars
@radix-ui/react-progress # Progress bars
```

---

## 📋 REBUILD CHECKLIST

1. [ ] Set up Tailwind config with DNA color tokens
2. [ ] Add font imports (Lora + Inter) to index.css
3. [ ] Copy `patterns.config.ts` and `typography.config.ts`
4. [ ] Copy `PatternBackground.tsx` UI component
5. [ ] Copy `PageSEO.tsx` and `config.ts`
6. [ ] Copy hero image asset (`hero-professional.jpeg`)
7. [ ] Copy `useAnimatedCounter` and `useScrollToTop` hooks
8. [ ] Build HeroSection with auth buttons
9. [ ] Build AnimatedStatsSection with 3 stat cards
10. [ ] Build InteractiveTimeline with 7-year data
11. [ ] Build SwipeableCardStack shared component
12. [ ] Build 5 C's sections (Connect → Convey)
13. [ ] Build HeroTriangleSection (DNA Framework nav)
14. [ ] Build BuildingTogetherSection
15. [ ] Build WhoIsDNAForSection (FAQ)
16. [ ] Build Footer
17. [ ] Wire up lazy loading in Index.tsx
18. [ ] Add waitlist popup (optional — needs Supabase)

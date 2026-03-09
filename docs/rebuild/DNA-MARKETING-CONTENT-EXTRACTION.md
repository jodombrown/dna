# DNA Marketing Pages — Full Content Extraction
> **Purpose:** Carry-forward reference for rebuilding all public/marketing pages in a new project.  
> **Extracted:** March 2026 from the current DNA codebase.

---

## Table of Contents
1. [Landing Page (/)](#1-landing-page)
2. [About (/about)](#2-about-page)
3. [Contact (/contact)](#3-contact-page)
4. [Manifesto (/manifesto)](#4-manifesto-page)
5. [Fact Sheet (/fact-sheet)](#5-fact-sheet-page)
6. [Pitch Deck (/pitch-deck)](#6-pitch-deck-page)
7. [Partner With DNA (/partner-with-dna)](#7-partner-with-dna)
8. [Partner Start (/partner-with-dna/start)](#8-partner-start)
9. [Partner Models (/partner-with-dna/models)](#9-partner-models)
10. [Partner Sectors (/partner-with-dna/sectors/:slug)](#10-partner-sectors)
11. [Waitlist (/waitlist)](#11-waitlist-page)
12. [Demo (/demo)](#12-demo-page)
13. [Install (/install)](#13-install-page)
14. [Resources (/resources)](#14-resources-page)
15. [Programs (/programs)](#15-programs-page)
16. [Services (/services)](#16-services-page)
17. [Legal Pages](#17-legal-pages)
18. [Phase Pages](#18-phase-pages)
19. [Shared Components](#19-shared-components)
20. [Configuration Data](#20-configuration-data)
21. [SEO Metadata](#21-seo-metadata)
22. [Assets & Images](#22-assets-and-images)

---

## 1. Landing Page

**Route:** `/`  
**File:** `src/pages/Index.tsx`  
**Auth redirect:** Logged-in users → `/dna/feed`

### Structure
1. **HeroSection** (`src/components/HeroSection.tsx`)
   - Kente pattern background via `PatternBackground`
   - Hero image: `src/assets/hero-professional.jpeg`
   - Headline: "Welcome to the Diaspora Network of Africa"
   - Subheadline: "Where the African diaspora goes from scattered potential to coordinated power."
   - Tagline: "One platform. Five ways to move Africa forward."
   - CTAs: "Sign in" → `/auth`, "Join Now" → `/auth?mode=signup`
   - Legal links: User Agreement, Privacy Policy, Terms & Conditions, Cookie Policy
   - DiasporaStats below hero (Mudcloth pattern background)

2. **PlatformFeatureShowcase** (`src/components/PlatformFeatureShowcase.tsx`)
   - HeroTriangleSection
   - ConnectSection, ConveneSection, CollaborateSection, ContributeSection, ConveySection
   - Each in `src/components/platform/`

3. **BuildingTogetherSection** (`src/components/BuildingTogetherSection.tsx`)
   - Mudcloth pattern background
   - Headline: "Join Us in Shaping Africa's Future"
   - 3 cards: Share Feedback, Track Our Progress, Learn About DNA

4. **WhoIsDNAForSection** (`src/components/WhoIsDNAForSection.tsx`)
   - FAQ accordion with 5 questions
   - Final CTA: "The African Diaspora Movement Starts Here" → Join Now

5. **Footer** + **WaitlistPopup** (timed popup)

### SEO
- Title: "DNA: Connect the African Diaspora to Drive Africa's Growth"
- Description: "Join 200M+ diaspora members on DNA..."
- Structured data: Organization + Website schemas

---

## 2. About Page

**Route:** `/about`  
**File:** `src/pages/About.tsx`

### Sections
1. **Hero** — "About DNA", badge "Our Story"
2. **Mission & Vision** — Two cards with border-l accents
   - Mission: "To create a unified platform that connects African diaspora professionals..."
   - Vision: "A thriving ecosystem where the African diaspora's collective knowledge..."
3. **Core Values** — Unity, Innovation, Impact (3 cards)
4. **Meet the Founder**
   - Photo: `/lovable-uploads/02154efb-0abe-4ed4-b41f-265e4a856e8d.png`
   - Name: Jaûne L. Odombrown, Founder & CEO
   - LinkedIn: `https://www.linkedin.com/in/jaunelamarr/`
   - Quote: "The African diaspora represents one of the world's most powerful yet underutilized resources..."
   - Two paragraphs of bio
5. **How DNA Works** — Connect, Collaborate, Contribute (3 cards with feature lists)
6. **CTA** — "Ready to Be Part of the Movement?"

### SEO
- Title: "About DNA: Our Mission to Unite the African Diaspora"
- Structured data: Organization + Founder Person schema

---

## 3. Contact Page

**Route:** `/contact`  
**File:** `src/pages/Contact.tsx`

### Content
- Hero: "Let's Build Together"
- 3 contact methods:
  1. WhatsApp — QR code + link `https://chat.whatsapp.com/GXZrIElj1gY2UZYVm6J8zh`
  2. Email — `aweh@diasporanetwork.africa`
  3. Join Waitlist — slide-in form
- Inquiry types: General, Partnership, Platform Feedback, Community Building
- WhatsApp QR image: `/lovable-uploads/dea2fe8e-c718-403d-b6be-24cd5152c4a4.png`

---

## 4. Manifesto Page

**Route:** `/manifesto`  
**File:** `src/pages/Manifesto.tsx`

### Design
- Background: Parchment `#F5F5F0`
- Scroll-driven line-by-line text reveals (framer-motion)
- Section numbers in copper `#B87333`
- Bold text in forest `#2D5A4A`
- Body text in serif font, dark `#1A1A1A`

### Full Text (10 sections)

**Section I:**
> They scattered us across oceans. Stripped our names. Silenced our tongues. Drew borders through our bloodlines and called it history. But they forgot one thing: **You cannot erase what is written in the body.**

**Section II:**
> For four hundred years, the strand stretched. Across the Atlantic. Through the Caribbean. Into the Americas, Europe, and beyond. It bent. It strained. It was tested by every cruelty human beings can invent. **It never broke.**

**Section III:**
> We are 200 million strong now. Scattered, yes, but not separated. In Brooklyn bodegas and London flats. In São Paulo favelas and Toronto high-rises. In Accra markets and Nairobi startups. In Dubai offices and Paris studios. In Mumbai tech hubs and Beijing trading floors. Wherever we are, we carry her with us. **Mother Africa's instructions are in our cells.**

**Section IV:**
> We are doctors healing communities and drivers navigating new cities. Engineers building the future and entrepreneurs taking risks. Artists capturing our truth and activists demanding justice. Teachers shaping minds and traders moving markets. Students dreaming of tomorrow and elders carrying yesterday. First-generation finding footing and second-generation finding roots. Those who left last year and those whose families left generations ago. **All of us. Dreamers who never stopped dreaming of home.**

**Section V:**
> We send $100 billion back each year, more than all foreign aid combined. We build schools we'll never sit in. Fund hospitals we'll never visit. Support families we haven't hugged in years. **We have always been the largest investor in Africa's future.** But we've been doing it alone. Fragmented. Uncoordinated. Invisible to each other.

**Section VI:**
> **What if we could see ourselves?** What if the nurse in Houston knew the tech founder in Lagos was building exactly what her community needs? What if the teacher in London could find the youth program in Dakar that's been waiting for her expertise? What if the investor in Atlanta could discover the social enterprise in Kigali that turns $10,000 into 100 jobs? What if the student in Berlin could mentor with the executive in Johannesburg who walked her same path twenty years ago? What if the grandmother in Kingston could finally teach the recipes she's been saving for family she's never met? **What if the diaspora could finally operate as one?**

**Section VII:**
> **This is why we built DNA.** Not an app. Not a platform. An operating system for collective power. A place to CONNECT. To find your people across borders and generations. A place to CONVENE. To gather, celebrate, strategize, and remember together. A place to COLLABORATE. To build together what none of us could build alone. A place to CONTRIBUTE. To give not just money, but time, knowledge, networks, and love. A place to CONVEY. To amplify the stories that have been whispered for too long.

**Section VIII:**
> We named it DNA for a reason. Because this network is not optional. It is not a nice-to-have. **It is who we are.** The same code that kept our ancestors alive is the code that will transform our continent. DNA replicates. It passes itself forward. It carries instructions across generations. **So will we.**

**Section IX:**
> **The strand was never broken.** We are simply making it visible again. giving it structure, giving it pathways, giving it purpose.

**Section X:**
> Africa is rising. And her children, all of us, everywhere, are part of that rise. Not as outsiders looking in. Not as donors with conditions. **As family. Coming home. Building together.** This is the moment. This is the movement. This is the mission. **We are DNA.** And we've been waiting for you.

### Components
- `ManifestoSection` — Full-viewport sections with Roman numeral headers
- `ManifestoLine` — Scroll-triggered line with configurable delay, bold variant
- `ManifestoLink` — Two variants: `five-c` (emerald underlined) and `subtle` (copper underlined)
- `ManifestoCTA` — Pulsing "JOIN THE NETWORK" button → `/auth`

### SEO
- Title: "The DNA Manifesto | We Are the Code That Survived"
- Sharing title: "We Are the Code That Survived"

---

## 5. Fact Sheet Page

**Route:** `/fact-sheet`  
**File:** `src/pages/FactSheetPage.tsx` (739 lines)

### Key Statistics
- 350M+ African Diasporans Worldwide
- $100B+ Annual Diaspora Remittances
- $500B Projected Remittances by 2035

### Sections
1. **Executive Summary** — The diaspora's scattered power narrative
2. **Founder** — Jaune Odombrown with initials avatar, LinkedIn link
3. **Who We Are** — Mission, Vision, Values (Ubuntu, Sankofa, Excellence)
4. **The 5Cs Cycle** — Full descriptions of each C with "Spiral Effect" callout
5. **Why It Matters** — Stats + opportunity narrative
6. **Where the Diaspora Lives** — Regional distribution bars + Top 5 countries + Top remittance recipients (Egypt $22.7B, Nigeria $19.8B, Morocco $12B, Ghana $4.6B, Kenya $4B+)
7. **Recent Developments** — Ghana GIPC reform 2025, Benin citizenship 2024, AU 6th Region
8. **How We're Different** — Diaspora-First, Systems-Change, Cultural Intelligence, Action-Oriented
9. **Join the Movement** — For Users, Partners, Investors (stakeholder dialog)
10. **Sources** — World Bank, GFRID, AU, etc.

### Features
- Share (Web Share API), Download PDF (window.print)
- Stakeholder contact dialog with email submission via edge function

---

## 6. Pitch Deck Page

**Route:** `/pitch-deck`  
**File:** `src/pages/PitchDeck.tsx` (883 lines)

### 12 Slides
1. **Title** — DNA logo + "Mobilizing the African Diaspora..."
2. **The Problem** — 200M+ people, $200B+ remittances, critical disconnect
3. **The Solution** — 5C Framework with horizontal/vertical layouts
4. **Market Opportunity** — 200M+, $200B+, $3.4T GDP by 2030
5. **Platform Features** — Verified Profiles, Smart Matching, Collaboration Spaces, Impact Tracking
6. **Traction** — 500+ beta users, 40+ countries, 15+ partnerships, testimonials
7. **Business Model** — Premium ($29/mo), Enterprise ($500-5000/mo), Platform Fees (5-10%), Data & Insights
8. **Go-to-Market** — 3 phases: Community Seeding → Viral Growth → Enterprise Expansion
9. **Competition** — LinkedIn/Facebook/Remittance Apps vs DNA advantages
10. **Team** — Jaûne Odombrown bio + Advisors
11. **Financials** — Q1-Q2 Foundation, Q3-Q4 Acceleration, Use of Funds (40/35/25%)
12. **The Ask** — $500K Seed Round, contact info

### Features
- Desktop: Horizontal scroll with navigation arrows + dot indicators
- Mobile: Vertical scroll
- Share + Download buttons
- AnimatedNumber component for stats
- Source citations per slide

---

## 7. Partner With DNA

**Route:** `/partner-with-dna`  
**File:** `src/pages/PartnerWithDna.tsx`

### Content (from `src/config/partnerContent.ts`)
- Hero: "Partner With DNA: Mobilize What's Possible for Africa and the Diaspora"
- Hero image: `src/assets/partner-hero.jpg`
- Why Partner section with 5 value propositions
- 5C engine image: `src/assets/5c-engine-new.jpg`
- 5Cs partner descriptions
- Sector grid (8 sectors from config)
- Partnership Advantage (4 items)
- CTAs: Explore Pathways, Book Strategic Call, Join DNA

---

## 8. Partner Start

**Route:** `/partner-with-dna/start`  
**File:** `src/pages/PartnerStart.tsx`

### Content
- 5-step partnership journey (from `onboardingSteps` config)
- Partnership inquiry form: Name, Org, Email, Location, Sector dropdown, Interest textarea
- Submits via mailto to `aweh@diasporanetwork.africa, jaune@diasporanetwork.africa`
- Meeting CTA section

---

## 9. Partner Models

**Route:** `/partner-with-dna/models`  
**File:** `src/pages/PartnerModels.tsx`

### 6 Models (from `src/config/partnerModels.ts`)
1. **National / City DNA Partner** — 12-36 months
2. **Corporate Innovation Partner** — 24-48 months
3. **HBCU Anchor Partner** — 18-36 months
4. **Hub Network Partner** — 12-24 months
5. **Capital Network Partner** — 24-60 months
6. **SDG Catalyst Partner** — 18-48 months

Each includes: Purpose, Partner Provides, DNA Provides, Use Cases, Timeline

---

## 10. Partner Sectors

**Route:** `/partner-with-dna/sectors/:slug`  
**File:** `src/pages/PartnerSector.tsx`

### 8 Sectors (from `src/config/partnerSectors.ts`)
1. **Public Sector & Economic Development** — `public-sector`
2. **Private Industry** — `private-industry`
3. **HBCUs** — `hbcus`
4. **Global Universities** — `global-universities`
5. **NGOs & Civil Society** — `ngos-civil-society`
6. **Innovation Ecosystems** — `innovation-ecosystems`
7. **Investors** — `investors`
8. **UN/SDG & Multilaterals** — `multilaterals-sdg`

Each sector has: Hero, 5Cs bullets, Roles, What You Bring/Receive, Partnership Models, Programs, CTA

### Sector Images
- `src/assets/sectors/public-sector-hero.jpg` + `public-sector-icon.png`
- `src/assets/sectors/private-industry-hero.jpg` + `private-industry-icon.png`
- `src/assets/sectors/hbcu-hero.jpg` + `hbcu-icon.png`
- `src/assets/sectors/university-hero.jpg` + `university-icon.png`
- `src/assets/sectors/ngo-hero.jpg` + `ngo-icon.png`
- `src/assets/sectors/innovation-hero.jpg` + `innovation-icon.png`
- `src/assets/sectors/investor-hero.jpg` + `investor-icon.png`
- `src/assets/sectors/sdgs-goals.jpg` + `multilateral-icon.png`

---

## 11. Waitlist Page

**Route:** `/waitlist`  
**File:** `src/pages/Waitlist.tsx`

### Content
- Hero: "Join the DNA Movement"
- 4 benefits: Early Access, Exclusive Events, Shape the Platform, Community First
- Form: Full Name, Email, Location (ComprehensiveLocationInput)
- Submits to `waitlist_signups` table + `send-universal-email` edge function
- Success state with "You're on the List!" and Explore/Refer buttons

---

## 12. Demo Page

**Route:** `/demo`  
**File:** `src/pages/Demo.tsx`

### 8 Scroll Sections (dark theme: `#0D1117` bg, `#E6EDF3` text)
1. The Opening (`DemoOpening`)
2. The Problem (`DemoProblem`)
3. The Solution (`DemoSolution`)
4. The Interconnection (`DemoInterconnection`)
5. The Journeys (`DemoJourneys`)
6. Who We Serve (`DemoPersonas`)
7. Meet DIA (`DemoDIA`)
8. The Movement (`DemoMovement`)

Components in `src/components/demo/sections/`  
Navigation dots in `src/components/demo/DemoNavDots.tsx`

---

## 13. Install Page

**Route:** `/install`  
**File:** `src/pages/Install.tsx`

### Content
- PWA install instructions for iOS (Safari) and Android (Chrome)
- Hero: "Welcome to Africa's Sixth Region"
- Phone mockups with gradient placeholders
- 4 beta features: Feed, Connect, Convey, Messaging
- About section: "Building Africa's Sixth Region" with AU context
- CTA: "Join Africa's Sixth Region"

---

## 14. Resources Page

**Route:** `/resources`  
**File:** `src/pages/Resources.tsx`

### Content (placeholder data)
6 resources across categories: Guides, Toolkits, Courses, Handbooks, Reports
- African Market Entry Guide 2024
- Investment Due Diligence Toolkit
- Building Sustainable Businesses in Africa
- Diaspora Remittance Optimization Handbook
- African Tech Ecosystem Report
- Cross-Border Business Legal Framework

---

## 15. Programs Page

**Route:** `/programs`  
**File:** `src/pages/Programs.tsx`

### Content (placeholder data)
4 programs:
- African Innovation Accelerator (12 weeks, 20 startups)
- Diaspora Leadership Fellowship (6 months, 50 fellows)
- Tech Skills Bootcamp (16 weeks, 30 students)
- Women in African Tech Initiative (9 months, 40 women)

---

## 16. Services Page

**Route:** `/services`  
**File:** `src/pages/Services.tsx`

### Content (placeholder data)
4 categories with 6 services:
- Consulting: Market Entry Strategy, Financial Modeling
- Advisory: Board Advisory, Technology Advisory
- Legal: Cross-Border Legal Services
- Education: Leadership Development Program

---

## 17. Legal Pages

### Privacy Policy (`/privacy-policy`)
- 10 accordion sections covering collection, use, sharing, security, rights, retention, transfers, children, changes, contact
- Contact: `privacy@diasporanetwork.africa`, DPO: `dpo@diasporanetwork.africa`

### Terms of Service (`/terms-of-service`)
- 9 sections: Acceptance, Purpose, Responsibilities, Content Guidelines, Privacy, IP, Liability, Termination, Contact
- Contact: `legal@diasporanetwork.africa`

### User Agreement (`/legal/user-agreement`)
- LinkedIn-style comprehensive agreement
- 8 sections: Introduction (Contract, Services, Members/Visitors, Changes), Obligations (Eligibility, Account, Payment, Notices, Sharing), Rights & Limits, Disclaimer, Termination, Governing Law (Delaware), General Terms, Dos & Don'ts
- Values: Ubuntu, Sankofa, Afro-futurism

### Cookie Policy (`/legal/cookie-policy`)
- 7 sections: What Are Cookies, Why, Types (table), Other Technologies, Your Choices, Updates, Contact

### Shared: `RelatedPolicies` component for cross-linking between legal pages

---

## 18. Phase Pages

6 development phase pages:
1. `/phase-1/market-research` — MarketResearchPhase.tsx
2. `/phase-2/prototyping` — PrototypingPhase.tsx
3. `/phase-3/customer-discovery` — CustomerDiscoveryPhase.tsx
4. `/phase-4/mvp` — MvpPhase.tsx
5. `/phase-5/beta-validation` — BetaValidationPhase.tsx
6. `/phase-6/go-to-market` — GoToMarketPhase.tsx

Each uses shared components:
- `PhaseHero` — gradient hero with badge, title, next-phase link
- `PhaseObjectives` — objective cards with progress bars
- `PhaseTimeline` — milestone timeline
- `PhaseMetrics` — KPI cards with targets

---

## 19. Shared Components

### Layout
- **UnifiedHeader** — Main navigation header
- **Footer** — Dark green footer (`hsl(151,75%,10%)`) with copyright, LinkedIn, documentation link
- **PatternBackground** — African pattern overlays (kente, mudcloth, ndebele, adinkra)

### Marketing Utilities
- **WaitlistPopup** — Timed popup for waitlist signup
- **WaitlistSlideIn** — Slide-in waitlist form
- **JoinDNADialog** — Sign-up dialog
- **BetaSignupDialog** — Beta access dialog
- **SurveyDialog** — User survey
- **AnimatedNumber** — Count-up animation for stats
- **FlipCard** — 3D flip cards for pitch deck
- **PageSEO** — SEO meta tags + structured data

### Brand Components
- **DiasporaStats** — AnimatedStatsSection + InteractiveTimeline + TestimonialsCarousel + CallToActionSection
- **MainPageFeedbackPanel** — Feedback collection panel

---

## 20. Configuration Data

### `src/lib/config.ts`
```
APP_URL: https://diasporanetwork.africa
APP_DOMAIN: diasporanetwork.africa
LinkedIn: https://www.linkedin.com/company/diasporanetworkafrica
Emails:
  support: aweh@diasporanetwork.africa
  legal: legal@diasporanetwork.africa
  privacy: privacy@diasporanetwork.africa
  dpo: dpo@diasporanetwork.africa
  admin: admin@diasporanetwork.africa
  notifications: notifications@diasporanetwork.africa
  welcome: welcome@diasporanetwork.africa
  noreply: noreply@diasporanetwork.africa
```

### `src/config/partnerContent.ts`
- 5Cs content descriptions for partners
- Partner page hero/why/advantage content
- 5-step onboarding flow

### `src/config/partnerModels.ts`
- 6 partnership model definitions with full details

### `src/config/partnerSectors.ts`
- 8 sector configurations with 5Cs bullets, roles, brings/receives, models, programs

---

## 21. SEO Metadata

| Page | Title | Keywords |
|------|-------|----------|
| `/` | DNA: Connect the African Diaspora to Drive Africa's Growth | african diaspora platform, diaspora networking, africa investment |
| `/about` | About DNA: Our Mission to Unite the African Diaspora | about diaspora network africa, DNA platform |
| `/contact` | Contact DNA: Partner With the African Diaspora Network | contact diaspora network, DNA partnership |
| `/manifesto` | The DNA Manifesto \| We Are the Code That Survived | manifesto, african diaspora, DNA movement |
| `/fact-sheet` | Platform Fact Sheet | — |
| `/pitch-deck` | DNA Demo \| The Operating System for the Global African Diaspora | — |
| `/waitlist` | Join the Waitlist \| DNA - Diaspora Network of Africa | — |
| `/privacy-policy` | Privacy Policy \| DNA Platform | — |
| `/terms-of-service` | Terms of Service \| DNA Platform | — |
| `/legal/cookie-policy` | Cookie Policy \| DNA Platform | — |

### Structured Data
- **Organization schema** — via `getOrganizationSchema()`
- **Website schema** — via `getWebsiteSchema()`
- **Person schema** — Jaûne L. Odombrown (About page)
- **ContactPage schema** — Contact page

---

## 22. Assets and Images

### Brand Assets
- `src/assets/dna-logo.png` — DNA logo
- `src/assets/hero-professional.jpeg` — Landing page hero image
- `src/assets/partner-hero.jpg` — Partner page hero
- `src/assets/5c-engine-new.jpg` — 5C engine diagram

### Sector Assets (all in `src/assets/sectors/`)
- 8 hero images + 8 icon images (see Section 10)

### Uploaded Assets (in `/lovable-uploads/`)
- Founder photo: `02154efb-0abe-4ed4-b41f-265e4a856e8d.png`
- WhatsApp QR: `dea2fe8e-c718-403d-b6be-24cd5152c4a4.png`

### Pattern SVGs (in `/public/patterns/`)
- `kente-pattern.svg`
- `mudcloth-pattern.svg`
- `ndebele-pattern.svg`
- `adinkra-pattern.svg`

### PWA Icons (in `/public/icons/`)
- `icon-192.png`

---

## Build Priority for New Project

### Tier 1 — Core Marketing (build first)
1. Landing page (hero + 5Cs showcase + FAQ + footer)
2. About page
3. Manifesto page
4. Contact page
5. Auth page

### Tier 2 — Business Development
6. Fact Sheet
7. Pitch Deck
8. Partner With DNA (hub + start + models + sectors)
9. Waitlist

### Tier 3 — Supporting Pages
10. Demo (interactive scroll experience)
11. Install (PWA instructions)
12. Legal pages (4)
13. Phase pages (6)

### Tier 4 — Placeholder Content
14. Resources, Programs, Services (currently placeholder data)

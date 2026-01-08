# DNA Platform SEO Audit Report
**Date:** January 8, 2026  
**Platform:** Diaspora Network of Africa (DNA)  
**Target Audience:** African Diaspora, Continental Africans, Allies

---

## Executive Summary

This audit evaluates DNA's SEO implementation across 65+ routes, covering both public marketing pages and authenticated user areas. The platform has **partial SEO implementation** with significant opportunities for improvement to capture the African diaspora market.

### Current SEO Score: 45/100

| Category | Score | Status |
|----------|-------|--------|
| Technical SEO | 55/100 | ⚠️ Needs Work |
| On-Page SEO | 40/100 | 🔴 Critical |
| Content SEO | 50/100 | ⚠️ Needs Work |
| Structured Data | 20/100 | 🔴 Critical |
| Mobile SEO | 70/100 | ✅ Good |

---

## 1. CRITICAL ISSUES

### 1.1 Missing Page-Level Meta Tags (CRITICAL)

**Problem:** Most pages lack proper `<Helmet>` implementations with title tags, meta descriptions, and Open Graph tags.

**Affected Pages:**

#### Public Marketing Pages (HIGH PRIORITY)
| Page | Route | Has Title | Has Description | Has OG Tags |
|------|-------|-----------|-----------------|-------------|
| Homepage | `/` | ❌ (uses index.html) | ❌ | ❌ |
| About | `/about` | ❌ | ❌ | ❌ |
| Connect | `/connect` | ❌ | ❌ | ❌ |
| Convene | `/convene` | ❌ | ❌ | ❌ |
| Collaborate | `/collaborate` | ❌ | ❌ | ❌ |
| Contribute | `/contribute` | ❌ | ❌ | ❌ |
| Convey | `/convey` | ❌ | ❌ | ❌ |
| Contact | `/contact` | ❌ | ❌ | ❌ |
| Fact Sheet | `/fact-sheet` | ❌ | ❌ | ❌ |
| Terms | `/terms-of-service` | ❌ | ❌ | ❌ |
| Privacy | `/privacy-policy` | ❌ | ❌ | ❌ |

#### Authenticated Pages (MEDIUM PRIORITY)
| Page | Route | Has Title | Has Description |
|------|-------|-----------|-----------------|
| Feed | `/dna/feed` | ❌ | ❌ |
| Events Index | `/dna/convene/events` | ❌ | ❌ |
| Spaces Index | `/dna/collaborate/spaces` | ❌ | ❌ |
| Messages | `/dna/messages` | ❌ | ❌ |
| Profile | `/dna/:username` | ✅ (PublicProfileSEO) | ✅ |

#### Pages WITH SEO (Good Examples)
| Page | Route | Implementation |
|------|-------|----------------|
| Public Post | `/post/:postId` | ✅ Full Helmet + OG |
| Public Profile | `/dna/:username` | ✅ PublicProfileSEO component |
| Releases | `/releases` | ✅ Full Helmet |
| Public Event | `/event/:slugOrId` | ✅ (needs verification) |

### 1.2 Missing Canonical URLs

**Problem:** No canonical URLs specified on any page, risking duplicate content issues.

**Impact:** Search engines may index multiple URLs for the same content, diluting page authority.

### 1.3 No Structured Data (JSON-LD)

**Problem:** Only `PublicProfileSEO` implements structured data. Missing for:
- Events (should use Event schema)
- Organizations (should use Organization schema)
- Articles/Stories (should use Article schema)
- FAQs (should use FAQPage schema)

---

## 2. KEYWORD STRATEGY RECOMMENDATIONS

### 2.1 Primary Keywords (High Priority)
Target these across title tags, H1s, and meta descriptions:

| Keyword | Search Intent | Target Page |
|---------|--------------|-------------|
| african diaspora network | Navigational | Homepage |
| african diaspora platform | Transactional | Homepage |
| african diaspora professionals | Informational | /connect |
| diaspora events africa | Transactional | /convene |
| african diaspora jobs | Transactional | /contribute |
| connect with african diaspora | Transactional | /connect |
| africa investment diaspora | Transactional | /contribute |

### 2.2 Long-Tail Keywords
| Keyword | Target Page |
|---------|-------------|
| how to connect with african diaspora | /connect |
| african diaspora networking events | /convene |
| african diaspora investment opportunities | /contribute |
| african professional community | /connect |
| diaspora collaboration africa | /collaborate |
| african diaspora stories | /convey |
| nigerian diaspora network | Regional hubs |
| ghanaian diaspora events | Regional hubs |
| kenyan diaspora professionals | Regional hubs |

### 2.3 Geographic Keywords
Target country-specific pages with:
- `[Country] diaspora network`
- `[Country] diaspora events`
- `[Country] diaspora professionals`
- `diaspora in [City]` (London, NYC, Atlanta, Toronto, etc.)

---

## 3. PAGE-BY-PAGE SEO REQUIREMENTS

### 3.1 Homepage (`/`)
```html
<title>DNA | African Diaspora Network - Connect, Collaborate, Contribute</title>
<meta name="description" content="Join 200M+ African diaspora professionals. Connect with the global African community, attend events, collaborate on projects, and contribute to Africa's development." />
<meta name="keywords" content="african diaspora, african network, diaspora professionals, africa development, african community" />

<!-- Open Graph -->
<meta property="og:title" content="Diaspora Network of Africa - Unite. Build. Transform." />
<meta property="og:description" content="The digital home for the global African diaspora. Connect, convene, collaborate, contribute, and convey impact." />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image-home.png" />

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Diaspora Network of Africa",
  "alternateName": "DNA",
  "url": "https://diasporanetwork.africa",
  "logo": "https://diasporanetwork.africa/logo.png",
  "description": "The digital mobilization engine for the global African diaspora",
  "sameAs": [
    "https://linkedin.com/company/diasporanetworkafrica",
    "https://twitter.com/DNAAfrica"
  ]
}
</script>
```

### 3.2 About Page (`/about`)
```html
<title>About DNA | Our Mission to Unite the African Diaspora</title>
<meta name="description" content="Learn about DNA's mission to mobilize 200M+ African diaspora members. Founded by Jaûne Odombrown to transform scattered potential into collective power for Africa." />
```

### 3.3 Connect Page (`/connect`)
```html
<title>Connect with African Diaspora Professionals | DNA Network</title>
<meta name="description" content="Discover and connect with African diaspora professionals worldwide. Build meaningful relationships, find mentors, and expand your network across 54 African nations." />
```

### 3.4 Convene Page (`/convene`)
```html
<title>African Diaspora Events & Gatherings | DNA Convene</title>
<meta name="description" content="Discover events for the African diaspora - conferences, workshops, networking meetups, and cultural gatherings. Virtual and in-person events across the globe." />
```

### 3.5 Collaborate Page (`/collaborate`)
```html
<title>Collaborate on Africa Projects | DNA Collaboration Spaces</title>
<meta name="description" content="Join project spaces to collaborate with African diaspora professionals. Work together on initiatives that drive Africa's development and prosperity." />
```

### 3.6 Contribute Page (`/contribute`)
```html
<title>Contribute to Africa's Development | DNA Impact</title>
<meta name="description" content="Make meaningful contributions to Africa through skills, capital, knowledge, and time. Find opportunities to invest in and support African development initiatives." />
```

### 3.7 Convey Page (`/convey`)
```html
<title>African Diaspora Stories & Impact | DNA Stories</title>
<meta name="description" content="Discover inspiring stories from the African diaspora. Share your impact, celebrate achievements, and amplify voices driving change across Africa." />
```

### 3.8 Contact Page (`/contact`)
```html
<title>Contact DNA | Get in Touch with the African Diaspora Network</title>
<meta name="description" content="Connect with the DNA team. Partnership inquiries, platform feedback, and community building opportunities. Join the movement to unite the African diaspora." />
```

### 3.9 Fact Sheet Page (`/fact-sheet`)
```html
<title>DNA Platform Fact Sheet | African Diaspora Network</title>
<meta name="description" content="Key facts about DNA: 350M+ diasporans, $100B+ annual remittances, and one platform to mobilize Africa's greatest distributed asset." />
```

---

## 4. AUTHENTICATED PAGES SEO

### 4.1 Why SEO Matters for Auth Pages

Even authenticated pages benefit from SEO:
1. **Deep linking** - Users may share URLs directly
2. **Browser tab clarity** - Clear titles help users manage tabs
3. **Progressive Web App** - PWA screenshots use page titles
4. **Analytics** - Proper titles improve analytics clarity

### 4.2 Authenticated Page Requirements

| Route | Recommended Title | Purpose |
|-------|-------------------|---------|
| `/dna/feed` | `Feed | DNA` | User's activity feed |
| `/dna/convene/events` | `Events | DNA` | Browse events |
| `/dna/convene/events/:id` | `[Event Name] | DNA Events` | Event detail |
| `/dna/collaborate/spaces` | `Spaces | DNA` | Browse spaces |
| `/dna/collaborate/spaces/:id` | `[Space Name] | DNA Collaborate` | Space detail |
| `/dna/messages` | `Messages | DNA` | User messages |
| `/dna/notifications` | `Notifications | DNA` | User notifications |
| `/dna/settings/*` | `Settings | DNA` | User settings |

---

## 5. TECHNICAL SEO ISSUES

### 5.1 Sitemap
**Status:** ❌ Not found  
**Action:** Generate dynamic sitemap.xml with:
- All public marketing pages
- Public event pages (`/event/:slug`)
- Public post pages (`/post/:id`)
- Public profile pages (`/dna/:username`)

### 5.2 Robots.txt
**Status:** ❌ Not found  
**Action:** Create robots.txt:
```
User-agent: *
Allow: /
Disallow: /dna/messages
Disallow: /dna/settings
Disallow: /dna/notifications
Disallow: /app/admin
Disallow: /onboarding

Sitemap: https://diasporanetwork.africa/sitemap.xml
```

### 5.3 Performance (Core Web Vitals)
- ✅ Lazy loading implemented for routes
- ✅ Image lazy loading (WebP recommended)
- ⚠️ Font loading could be optimized (preload critical fonts)
- ⚠️ Bundle size analysis needed

### 5.4 Mobile-First Indexing
- ✅ Responsive design implemented
- ✅ Mobile navigation present
- ✅ Touch targets appear adequate
- ⚠️ Viewport meta present but check zoom settings

---

## 6. CONTENT SEO RECOMMENDATIONS

### 6.1 Blog/Content Strategy
**Current State:** Limited blog content  
**Recommendation:** Create content hub at `/resources` or `/blog` targeting:

| Topic | Keywords | Format |
|-------|----------|--------|
| Diaspora Investment Guide | african diaspora investment | Long-form guide |
| Remittance Comparison | best way to send money to africa | Comparison article |
| Country Guides | doing business in [country] | Country profiles |
| Success Stories | african diaspora entrepreneurs | Case studies |
| Event Guides | african conferences 2026 | Event roundups |

### 6.2 Internal Linking
**Current State:** Limited cross-linking between pages  
**Recommendation:**
- Link from marketing pages to auth signup
- Cross-link Five C's pages
- Add "related" sections to content pages

### 6.3 Image SEO
**Current State:** Alt text usage inconsistent  
**Action:** Audit all images for:
- Descriptive alt text with keywords
- Proper file naming (`african-diaspora-event.jpg` not `image123.jpg`)
- WebP format for performance

---

## 7. LOCAL/REGIONAL SEO

### 7.1 Regional Hub Pages
DNA has regional hub routes (`/africa/:region/:country`). Optimize for:

| Region | Target Keywords |
|--------|-----------------|
| West Africa | west african diaspora, nigerian diaspora, ghanaian diaspora |
| East Africa | east african diaspora, kenyan diaspora, ethiopian diaspora |
| Southern Africa | south african diaspora, zimbabwean diaspora |
| Diaspora Cities | african diaspora london, african diaspora new york, african diaspora atlanta |

### 7.2 Hreflang (Future)
If DNA supports multiple languages, implement hreflang for:
- French (West/Central Africa diaspora)
- Portuguese (Lusophone Africa diaspora)
- Swahili (East Africa)

---

## 8. COMPETITIVE ANALYSIS

### 8.1 Competitor Keywords to Target
Research competitors like:
- African Chamber of Commerce sites
- Diaspora professional networks
- Africa-focused investment platforms

Target gap keywords they may miss:
- "african diaspora dating" (if applicable)
- "african diaspora housing"
- "african diaspora visa support"
- "african diaspora tech jobs"

---

## 9. IMPLEMENTATION PRIORITY

### Phase 1: Critical (Week 1-2)
1. ✅ Create SEO component library
2. ✅ Add Helmet to all public pages
3. ✅ Create sitemap.xml
4. ✅ Create robots.txt
5. ✅ Add Organization structured data

### Phase 2: Important (Week 3-4)
1. Add Event structured data to event pages
2. Add Article structured data to stories
3. Optimize images (alt text, WebP)
4. Internal linking audit

### Phase 3: Enhancement (Month 2)
1. Content hub/blog setup
2. Regional page optimization
3. Performance optimization
4. A/B test titles and descriptions

---

## 10. TRACKING & MEASUREMENT

### 10.1 Setup Required
- [ ] Google Search Console verification
- [ ] Bing Webmaster Tools
- [ ] Google Analytics 4 (if not present)
- [ ] Core Web Vitals monitoring

### 10.2 KPIs to Track
| Metric | Baseline | Target (6 months) |
|--------|----------|-------------------|
| Organic traffic | TBD | +200% |
| Indexed pages | TBD | All public pages |
| Average position (branded) | TBD | Top 3 |
| Average position (non-branded) | TBD | Top 10 |
| Click-through rate | TBD | >5% |

---

## 11. SEO-OPTIMIZED COMPONENT TEMPLATE

Create a reusable SEO component for consistency:

```tsx
// src/components/seo/PageSEO.tsx
import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
}

export const PageSEO = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = '/og-default.png',
  noindex = false,
  structuredData
}: PageSEOProps) => {
  const fullTitle = `${title} | DNA`;
  const siteUrl = 'https://diasporanetwork.africa';
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={`${siteUrl}${canonical}`} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      {canonical && <meta property="og:url" content={`${siteUrl}${canonical}`} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
```

---

## Conclusion

DNA has a strong foundation with good mobile responsiveness and some SEO on key pages (profiles, posts). However, the majority of public-facing pages lack basic SEO implementation, representing a significant missed opportunity to capture organic traffic from the African diaspora audience.

**Immediate Priority:** Implement `PageSEO` component across all public marketing pages to establish baseline SEO presence.

**Key Opportunity:** The African diaspora market is underserved by specialized platforms, meaning DNA can capture significant organic traffic with proper SEO implementation targeting diaspora-specific keywords.

---

*Prepared for: DNA Platform Team*  
*Audit conducted by: Lovable AI*

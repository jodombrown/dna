# DNA Responsive Architecture Audit Report

**Date:** January 1, 2026
**Purpose:** Desktop Intent-Aware Mission View buildout preparation
**Branch:** `claude/audit-responsive-architecture-mV37a`

---

## Executive Summary

The DNA platform has a well-structured responsive architecture with clear separation between mobile and desktop experiences. Key findings:

1. **Mobile-first architecture is solid** - Uses `useMobile()` hook with breakpoints at 768px (mobile) and 1024px (desktop)
2. **Bottom navigation exists for mobile** - `MobileBottomNav` provides Five C's access (Connect, Convene, Feed, Collaborate, More menu)
3. **PulseBar already hidden on mobile** - Returns `null` when `isMobile` is true (safe for desktop buildout)
4. **Layout system is view-state aware** - `ViewStateContext` + `LayoutController` pattern provides intelligent layout switching
5. **Feed has dedicated mobile experience** - Completely different render path for mobile with custom header
6. **Five C's navigation split** - Only 3 C's in bottom nav; Contribute + Convey are in "More" menu
7. **Header height: 64px (h-16)** - Consistent across mobile/desktop with `pt-14 sm:pt-16` padding
8. **No major technical debt** - Responsive patterns are consistent and mobile-first

---

## 1. Breakpoint Configuration

### Tailwind Defaults (Used)

| Breakpoint | Value   | Purpose in DNA |
|------------|---------|----------------|
| `sm`       | 640px   | Minor responsive adjustments |
| `md`       | 768px   | **Mobile → Tablet transition** |
| `lg`       | 1024px  | **Tablet → Desktop transition** |
| `xl`       | 1280px  | Rarely used |
| `2xl`      | 1400px  | Container max-width only |

### useMobile Hook Breakpoints (`src/hooks/useMobile.ts:4-9`)

```typescript
const BREAKPOINTS = {
  mobile: 640,    // Unused in hook logic
  tablet: 768,    // isMobile if < 768
  desktop: 1024,  // isDesktop if >= 1024
  xl: 1280,
}
```

**Key Thresholds:**
- `isMobile`: `width < 768px`
- `isTablet`: `768px <= width < 1024px`
- `isDesktop`: `width >= 1024px`

---

## 2. Layout System Architecture

### Component Hierarchy

```
BaseLayout (src/layouts/BaseLayout.tsx)
├── UnifiedHeader (fixed, z-50)
├── AccountDrawer (drawer component)
├── PulseBar (desktop only, z-40, sticky below header)
├── Main Content Area (pt-14 sm:pt-16)
│   └── [Page Component]
│       └── LayoutController (optional)
│           ├── ThreeColumnLayout
│           ├── TwoColumnLayout
│           ├── FullCanvasLayout
│           └── DetailViewLayout
└── FeedbackFAB
```

### Layout Components

| Component | File Path | Mobile Behavior | Desktop Behavior |
|-----------|-----------|-----------------|------------------|
| `BaseLayout` | `src/layouts/BaseLayout.tsx:26-95` | Full width, stacked | Same wrapper, adaptive children |
| `ThreeColumnLayout` | `src/layouts/ThreeColumnLayout.tsx` | Single column stack | 3-column grid (15-70-15% default) |
| `TwoColumnLayout` | `src/layouts/TwoColumnLayout.tsx` | Single column stack | 2-column grid (60-40% default) |
| `FullCanvasLayout` | `src/layouts/FullCanvasLayout.tsx` | Sidebar as overlay | Side-by-side (20-80%) |
| `DetailViewLayout` | `src/layouts/DetailViewLayout.tsx` | Single column + back nav | 2-column with context rail |

### ViewState → Layout Mapping (`src/contexts/ViewStateContext.tsx:107-194`)

| View State | Layout Type | Column Widths |
|------------|-------------|---------------|
| `DASHBOARD_HOME` | ThreeColumn | 25% - 50% - 25% |
| `CONNECT_MODE` | ThreeColumn | 15% - 70% - 15% |
| `CONVENE_MODE` | TwoColumn | 60% - 40% |
| `MESSAGES_MODE` | TwoColumn | 35% - 65% |
| `COLLABORATE_MODE` | FullCanvas | 20% - 80% |
| `CONTRIBUTE_MODE` | TwoColumn | 55% - 45% |
| `CONVEY_MODE` | ThreeColumn | 15% - 70% - 15% |
| `FOCUS_DETAIL_MODE` | DetailView | Full width + optional rail |

---

## 3. Navigation Architecture

### Mobile Navigation

| Component | File Path | Visibility | Behavior |
|-----------|-----------|------------|----------|
| `UnifiedHeader` | `src/components/UnifiedHeader.tsx` | All screens | 64px fixed header, hamburger on mobile (public only) |
| `MobileBottomNav` | `src/components/mobile/MobileBottomNav.tsx:147` | Mobile only (`md:hidden`) | 64px (h-16) fixed bottom bar |
| `MobileHeader` | `src/components/mobile/MobileHeader.tsx` | Feed only | Custom feed header replaces UnifiedHeader |

### Desktop Navigation

| Component | Visibility | Location |
|-----------|------------|----------|
| `UnifiedHeader` 5C Nav | `hidden lg:flex` (line 264) | Top bar |
| Utility Nav (Feed, Messages) | `hidden md:flex` (line 301) | Top bar |
| `PulseBar` | Desktop only | Sticky below header |

### Mobile Bottom Navigation Items (`MobileBottomNav.tsx:47-85`)

```
Primary (in bottom bar):
├── Connect (/dna/connect)
├── Convene (/dna/convene)
├── Feed (/dna/feed) - CENTER
├── Collaborate (/dna/collaborate)
└── More (opens sheet)

In "More" Menu:
├── DIA (AI features)
├── Messages (/dna/messages)
├── Contribute (/dna/contribute)
├── Convey (/dna/convey)
├── Notifications
└── Settings
```

**Critical Finding:** Contribute and Convey are **NOT** in the primary mobile nav - they're in the "More" menu.

---

## 4. Mobile-Specific Components

| Component | File Path | Purpose | Desktop Equivalent |
|-----------|-----------|---------|-------------------|
| `MobileBottomNav` | `src/components/mobile/MobileBottomNav.tsx` | Bottom tab bar | PulseBar + Header nav |
| `MobileHeader` | `src/components/mobile/MobileHeader.tsx` | Custom feed header | UnifiedHeader |
| `MobileFeedView` | `src/components/mobile/MobileFeedView.tsx` | Mobile feed layout | LayoutController |
| `MobileProfileView` | `src/components/mobile/MobileProfileView.tsx` | Mobile profile | Desktop profile layout |
| `MobileMessagingView` | `src/components/mobile/MobileMessagingView.tsx` | Mobile messages | TwoColumnLayout |
| `MobilePostButton` | `src/components/mobile/MobilePostButton.tsx` | FAB for posting | Inline composer |

---

## 5. Desktop-Specific Components

| Component | File Path | Purpose | Mobile Equivalent |
|-----------|-----------|---------|-------------------|
| `PulseBar` | `src/components/pulse/PulseBar.tsx` | Five C's status bar | MobileBottomNav |
| `ProfileStrengthCard` | Used in sidebars | Profile completion | Floating/banner |
| `DashboardModules` | Right column widgets | Activity widgets | Hidden or collapsed |
| `ConveneContextWidgets` | `hidden lg:block` | Context sidebar | Hidden |
| `DiaContextual` (floating) | Mobile FAB mode | DIA panel | Right sidebar widget |

---

## 6. Dashboard/Feed Architecture

### Mobile Feed (`src/pages/dna/Feed.tsx:224-303`)

```
Mobile Dashboard (Feed):
├── MobileHeader (fixed, custom)
├── MobileProfileCompletionBanner
├── MobileFeedTabs (horizontal scroll)
├── FeedTabExplainer
├── Feed Content (PersonalizedFeed or UniversalFeedInfinite)
└── MobileBottomNav (fixed)
```

**Special behavior:** Mobile feed uses CSS to **hide UnifiedHeader** and provides its own header.

### Desktop Feed (`src/pages/dna/Feed.tsx:307-331`)

```
Desktop Dashboard (Feed):
├── UnifiedHeader (via BaseLayout)
├── PulseBar (via BaseLayout)
└── LayoutController
    ├── leftColumn: null (hidden)
    ├── centerColumn: Feed content
    └── rightColumn: DashboardModules
```

### Key Difference
- **Mobile:** Completely separate render path with custom header
- **Desktop:** Uses LayoutController with three-column layout

---

## 7. Five C's Hub Pages Assessment

### CONNECT Hub (`src/pages/dna/connect/Connect.tsx`)

| Aspect | Details |
|--------|---------|
| File Path | `src/pages/dna/connect/Connect.tsx` |
| Mobile Layout | Single column, full width |
| Desktop Layout | Two columns (flex-1 + 320px sidebar) |
| Responsive Pattern | `flex flex-col lg:flex-row lg:gap-8` |
| Right Sidebar | `hidden lg:block lg:w-80` |
| Mobile DIA | Floating button mode |

### CONVENE Hub (`src/pages/dna/convene/ConveneHub.tsx`)

| Aspect | Details |
|--------|---------|
| File Path | `src/pages/dna/convene/ConveneHub.tsx` |
| Mobile Layout | Single column stack |
| Desktop Layout | Grid: `grid-cols-1 lg:grid-cols-[1fr_300px]` |
| Context Widgets | `hidden lg:block` |
| Mobile Nav | Uses MobileBottomNav |

### COLLABORATE Hub (`src/pages/dna/collaborate/CollaborateHub.tsx`)

| Aspect | Details |
|--------|---------|
| File Path | `src/pages/dna/collaborate/CollaborateHub.tsx` |
| Mobile Layout | Single column, centered hero |
| Desktop Layout | Single container, max-w-7xl |
| Grid Pattern | `grid gap-4 md:grid-cols-2` for space cards |
| Mobile Nav | Uses MobileBottomNav |

### CONTRIBUTE Hub (`src/pages/dna/contribute/ContributeHub.tsx`)

| Aspect | Details |
|--------|---------|
| File Path | `src/pages/dna/contribute/ContributeHub.tsx` |
| Mobile Layout | Single column stack |
| Desktop Layout | Container with max-w-7xl |
| Card Grid | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Mobile Nav | Uses MobileBottomNav |

### CONVEY Hub (`src/pages/dna/convey/ConveyHub.tsx`)

| Aspect | Details |
|--------|---------|
| File Path | `src/pages/dna/convey/ConveyHub.tsx` |
| Mobile Layout | Uses LayoutController |
| Desktop Layout | ThreeColumnLayout via LayoutController |
| Unique Pattern | Only hub using LayoutController fully |
| Responsive Filters | `flex-col sm:flex-row` for filter row |

---

## 8. Existing Responsive Patterns

### Common Grid Patterns

```css
/* Most common - 1 → 2 → 3 columns */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Mobile grid - 2 columns on mobile */
grid-cols-2 md:grid-cols-3 lg:grid-cols-4

/* Sidebar pattern */
flex flex-col lg:flex-row lg:gap-8
```

### Common Visibility Patterns

```css
/* Hide on mobile, show on desktop */
hidden lg:block
hidden md:block

/* Show on mobile, hide on desktop */
md:hidden
lg:hidden
```

### Typography Scaling (from index.css)

```css
.mobile-heading { font-size: clamp(1.5rem, 5vw, 2.5rem); }
.mobile-subheading { font-size: clamp(1.125rem, 4vw, 1.875rem); }
.mobile-body { font-size: clamp(0.875rem, 3vw, 1.125rem); }
```

### Spacing Patterns

```css
/* Container padding */
px-4 sm:px-6 lg:px-8

/* Section spacing */
py-4 lg:py-6

/* Gap scaling */
gap-3 md:gap-4 lg:gap-6
```

---

## 9. Pulse Bar Integration Analysis

### Current Implementation (`src/components/pulse/PulseBar.tsx`)

```typescript
export function PulseBar() {
  const { isMobile } = useMobile();

  // Don't render on mobile - preserve existing mobile UI
  if (isMobile) {
    return null;
  }
  // ...
}
```

**Location:** Rendered in `BaseLayout.tsx:76` before main content
**Position:** `sticky top-14 sm:top-16 z-40`
**Height:** ~60px (py-2 with 14px items)

### Integration Points

| Concern | Current State | Risk Level |
|---------|---------------|------------|
| Mobile rendering | Returns null | **SAFE** |
| Header stacking | Below UnifiedHeader | **SAFE** |
| Z-index hierarchy | z-40 (header is z-50) | **SAFE** |
| Content offset | Header handles pt-14 sm:pt-16 | **MEDIUM** |

### Recommendation

**PulseBar should remain hidden on mobile** (`hidden lg:block` pattern already in place via `useMobile()` check).

The mobile equivalent of PulseBar functionality is:
- **Navigation:** MobileBottomNav provides Five C's access
- **Status indicators:** Could be added to MobileHeader or as badges on bottom nav
- **Quick actions:** "More" menu provides access to all features

---

## 10. CSS/Styling Architecture

### Structure

| Type | Details |
|------|---------|
| Framework | Pure Tailwind CSS |
| Custom CSS | `src/index.css` (607 lines) |
| Enhanced interactions | `src/styles/enhanced-interactions.css` |
| CSS Modules | Not used |
| Styled Components | Not used |

### Global Mobile Protections (`index.css:8-20`)

```css
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Prevent iOS zoom on input focus */
@media (max-width: 768px) {
  input, textarea, select {
    font-size: 16px !important;
  }
}
```

### Custom Mobile Utilities

- `.mobile-container` - Responsive padding
- `.mobile-grid-*` - Responsive grid systems
- `.touch-target-*` - WCAG compliant touch targets (48px+)
- `.mobile-modal` - Responsive modal sizing
- `.safe-area-*` - iOS safe area handling
- `.pb-safe` - Safe area bottom padding

---

## 11. Mobile Navigation for Five C's

### Current State

| C | Bottom Nav | Location | Accessible Via |
|---|------------|----------|----------------|
| **Connect** | Primary | Position 1 | Direct tap |
| **Convene** | Primary | Position 2 | Direct tap |
| **Collaborate** | Primary | Position 4 | Direct tap |
| **Contribute** | **Secondary** | More menu | 2 taps |
| **Convey** | **Secondary** | More menu | 2 taps |

### Issue Identified

Contribute and Convey are "second-class citizens" on mobile - buried in the More menu. This may need addressing if these features become more prominent.

### Header Height Stack (Mobile)

```
UnifiedHeader:    64px (h-16)
Content padding:  56px (pt-14) or 64px (sm:pt-16)
MobileBottomNav:  64px (h-16)
Safe area:        env(safe-area-inset-bottom)
```

---

## 12. Risk Assessment

### High Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| Feed mobile layout | Custom render path with CSS header hiding | Don't modify Feed without understanding dual-path |
| MobileBottomNav z-index (z-50) | Could conflict with modals | Keep modals at z-50+ |
| PulseBar sticky positioning | Could conflict with new sticky elements | Coordinate z-index carefully |

### Low Risk Areas

| Area | Why Safe |
|------|----------|
| PulseBar desktop buildout | Already returns null on mobile |
| ThreeColumnLayout changes | Automatically stacks on mobile |
| TwoColumnLayout changes | Automatically stacks on mobile |
| Adding desktop-only features | Use `hidden lg:block` pattern |
| Right sidebar modifications | Already `hidden lg:block` on all hubs |

### Recommended Approach

- [x] **PulseBar already hidden on mobile** - No changes needed
- [ ] **Create mobile-specific Pulse Bar variant** - Not needed currently
- [ ] **Pulse Bar transforms to bottom nav** - Already handled by MobileBottomNav
- [x] **Desktop buildout is SAFE** - Mobile UI protected by useMobile() checks

---

## 13. Critical Questions Answered

### 1. Is there a bottom navigation bar on mobile?

**YES** - `MobileBottomNav` (`md:hidden`) provides:
- Connect, Convene, Feed, Collaborate as primary tabs
- "More" menu for Contribute, Convey, Messages, Notifications, Settings

### 2. What's the mobile nav height?

- **Header:** 64px (h-16)
- **Bottom Nav:** 64px (h-16) + safe area
- **Total reserved space:** ~128px + safe areas

### 3. Is the dashboard different on mobile vs desktop?

**YES** - Completely different render paths:
- Mobile: Custom `MobileHeader` + `MobileFeedTabs` + single column
- Desktop: `LayoutController` with `ThreeColumnLayout`

### 4. Are there mobile-only features that could conflict?

| Feature | Conflict Risk |
|---------|--------------|
| MobileHeader CSS hiding UnifiedHeader | Low - only on Feed |
| MobileBottomNav fixed positioning | Low - standard pattern |
| Floating DIA button | Medium - check z-index |

### 5. What's the mobile experience for new users?

- `FirstTimeWalkthrough` component handles onboarding
- `ProfileCompletionNudge` shows as banner on desktop
- `MobileProfileCompletionBanner` shows on mobile feed

---

## 14. Key Files for Responsive Behavior

| Purpose | File Path |
|---------|-----------|
| Breakpoint hook | `src/hooks/useMobile.ts` |
| View state context | `src/contexts/ViewStateContext.tsx` |
| Layout controller | `src/components/LayoutController.tsx` |
| Base layout wrapper | `src/layouts/BaseLayout.tsx` |
| Three-column layout | `src/layouts/ThreeColumnLayout.tsx` |
| Two-column layout | `src/layouts/TwoColumnLayout.tsx` |
| Full canvas layout | `src/layouts/FullCanvasLayout.tsx` |
| Detail view layout | `src/layouts/DetailViewLayout.tsx` |
| Mobile bottom nav | `src/components/mobile/MobileBottomNav.tsx` |
| Unified header | `src/components/UnifiedHeader.tsx` |
| PulseBar | `src/components/pulse/PulseBar.tsx` |
| Global CSS | `src/index.css` |
| Feed page | `src/pages/dna/Feed.tsx` |

---

## 15. Summary & Recommendations

### Architecture Strengths

1. **Clean separation** - Mobile/desktop logic centralized in `useMobile()` hook
2. **View-state driven layouts** - `ViewStateContext` provides intelligent layout switching
3. **Consistent patterns** - Same responsive utilities used across all hubs
4. **Mobile-first CSS** - Base styles target mobile, breakpoints add desktop features
5. **Protected mobile UI** - PulseBar already returns null on mobile

### Recommendations for Desktop Buildout

1. **Use existing patterns** - Follow `hidden lg:block` for desktop-only features
2. **Keep PulseBar mobile-null** - No changes needed to mobile protection
3. **Test at 768px and 1024px** - These are the critical breakpoints
4. **Avoid modifying Feed mobile path** - It has custom header handling
5. **Use LayoutController** - It automatically handles responsive stacking
6. **Check z-index hierarchy** - Header (z-50) > PulseBar (z-40) > content

### Safe to Proceed

The desktop Intent-Aware Mission View buildout can proceed **without risk to mobile experience**. The architecture is well-structured with clear separation of concerns.

---

*Report generated by Claude Code*
*Commit to branch: `claude/audit-responsive-architecture-mV37a`*

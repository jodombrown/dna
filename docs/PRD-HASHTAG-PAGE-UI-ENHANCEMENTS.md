# PRD: Hashtag Page UI Enhancements

**Document Version:** 1.0  
**Created:** December 2024  
**Status:** Draft  
**Priority:** High  

---

## 1. Executive Summary

This PRD outlines UI/UX improvements for the Hashtag Page (`/dna/hashtag/:hashtag`) to enhance visual appeal, information hierarchy, and consistency with the DNA platform design system. The current implementation has layout issues, particularly with the stats section (posts, followers, created date) which appears cramped and poorly aligned on mobile devices.

---

## 2. Problem Statement

### Current Issues (See Reference Screenshot)

1. **Stats Section Layout**
   - Posts count, followers count, and "Created X ago" appear misaligned
   - Text wraps awkwardly ("Created 1 day ago" breaks across lines)
   - Icons and text have inconsistent spacing
   - No visual hierarchy distinguishing primary metrics from metadata

2. **Header Card Design**
   - Crowded layout with hashtag name, badge, follow button, and share all competing for attention
   - Type badge ("Community") placement feels disconnected from the hashtag name
   - Stats blend into the header without clear separation

3. **Mobile Responsiveness**
   - Stats row overflows or wraps poorly on smaller screens
   - Button group may not stack appropriately
   - Content feels cramped on mobile viewports

4. **Visual Consistency**
   - Design doesn't follow DNA's established visual patterns from other pages
   - Missing the "cultural authenticity" aesthetic defined in DNA guidelines
   - No subtle backgrounds, gradients, or visual depth

---

## 3. Proposed Solution

### 3.1 Redesigned Stats Section

**Current:**
```
[TrendingUp] 1 posts | [Users] 0 followers | [Calendar] Created 1 day ago
```

**Proposed:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│      1          │       0         │    Jan 2025     │
│    Posts        │   Followers     │    Created      │
└─────────────────┴─────────────────┴─────────────────┘
```

**Design Specifications:**
- Use a grid layout (3 equal columns on desktop, stack on mobile)
- Large, bold numbers for metric values
- Smaller, muted label text below
- Optional subtle background or border for visual grouping
- Remove icons OR use them more subtly as decoration

### 3.2 Improved Header Structure

**Proposed Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [Back to Feed]                                        │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────┐   #hashtag                [Follow] [Share]  │
│  │  #  │   Community • Verified                      │
│  └─────┘                                              │
│                                                       │
│  Description text goes here if available...          │
│                                                       │
│  ┌─────────────┬─────────────┬─────────────┐         │
│  │     1       │      0      │  Jan 2025   │         │
│  │   Posts     │  Followers  │   Created   │         │
│  └─────────────┴─────────────┴─────────────┘         │
│                                                       │
│  [Owner info block if personal hashtag]              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Key Changes:**
- Move badges inline with hashtag name (separated by bullet)
- Separate stats into dedicated section with clear visual boundary
- Add subtle gradient or pattern background to stats area
- Use DNA copper accent for visual interest

### 3.3 Mobile-First Responsive Design

**Mobile (< 640px):**
- Stats stack vertically OR display as 3-column compact grid
- Action buttons (Follow, Share) stack below hashtag info
- Increase touch targets for buttons
- Ensure minimum 44px tap targets

**Tablet (640px - 1024px):**
- Stats remain in horizontal row with proper spacing
- Buttons align to the right

**Desktop (> 1024px):**
- Current layout but enhanced visually

### 3.4 Visual Design Tokens

Following DNA Design System:

```css
/* Use existing semantic tokens */
--stats-background: hsl(var(--muted) / 0.5);
--stats-border: hsl(var(--border));
--stats-value-color: hsl(var(--foreground));
--stats-label-color: hsl(var(--muted-foreground));
--accent-copper: hsl(var(--dna-copper));
```

---

## 4. Component Architecture

### 4.1 New Components to Create

#### `HashtagStatsGrid.tsx`
Reusable stats display component:
```tsx
interface HashtagStatsGridProps {
  postCount: number;
  followerCount: number;
  createdAt: string | Date;
}
```

#### `HashtagHeader.tsx`
Refactored header component with improved layout:
```tsx
interface HashtagHeaderProps {
  hashtag: HashtagDetails;
  isFollowing: boolean;
  onToggleFollow: () => void;
  isOwner: boolean;
}
```

### 4.2 Files to Modify

1. `src/pages/dna/HashtagFeed.tsx` - Main page refactor
2. `src/index.css` - Add any needed design tokens
3. `src/components/feed/TrendingHashtags.tsx` - Ensure consistency

---

## 5. Detailed Specifications

### 5.1 Stats Grid Component

| Property | Desktop | Mobile |
|----------|---------|--------|
| Layout | 3-column grid | 3-column grid (compact) |
| Number font size | text-2xl (1.5rem) | text-xl (1.25rem) |
| Number font weight | font-bold | font-bold |
| Label font size | text-sm (0.875rem) | text-xs (0.75rem) |
| Label color | muted-foreground | muted-foreground |
| Container padding | p-4 | p-3 |
| Background | muted/50 | muted/50 |
| Border radius | rounded-lg | rounded-lg |
| Column gap | gap-4 | gap-2 |

### 5.2 Date Formatting

**Current:** "Created 1 day ago"  
**Proposed Options:**

1. **Relative (compact):** "1d ago" or "Jan 26"
2. **Absolute:** "Jan 26, 2025"
3. **Relative with fallback:** 
   - < 7 days: "3 days ago"
   - ≥ 7 days: "Jan 26, 2025"

**Recommendation:** Use absolute date format for clarity ("Jan 2025" or "Jan 26, 2025")

### 5.3 Interaction States

| Element | Hover | Active | Disabled |
|---------|-------|--------|----------|
| Follow Button | bg-opacity-90 | scale(0.98) | opacity-50 |
| Share Button | bg-accent | scale(0.98) | - |
| Stat Item | subtle highlight | - | - |

---

## 6. Accessibility Requirements

- [ ] Stats announced properly by screen readers
- [ ] Minimum contrast ratio 4.5:1 for text
- [ ] Focus indicators visible on all interactive elements
- [ ] Semantic HTML structure (use `<dl>`, `<dt>`, `<dd>` for stats if appropriate)
- [ ] Touch targets minimum 44x44px

---

## 7. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Visual alignment issues | Multiple | Zero |
| Mobile usability score | - | 90+ (Lighthouse) |
| Time to understand page info | - | < 3 seconds |
| User feedback | Negative | Positive |

---

## 8. Implementation Phases

### Phase 1: Stats Section Redesign (Priority: High)
- Create `HashtagStatsGrid` component
- Implement responsive grid layout
- Update date formatting
- Test on mobile devices

### Phase 2: Header Restructure (Priority: Medium)
- Reorganize header component
- Improve badge placement
- Enhance visual hierarchy

### Phase 3: Visual Polish (Priority: Medium)
- Add subtle backgrounds/gradients
- Implement consistent DNA design patterns
- Add micro-interactions

### Phase 4: Platform-Wide Consistency (Priority: Low)
- Apply similar patterns to related pages (Profile stats, Group stats, etc.)
- Create shared stat display components

---

## 9. Design Mockup Reference

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Feed                                            │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐                                               │
│  │    #     │   #gabacenter                    [Follow ▼]  │
│  │          │   Community                      [Share]      │
│  └──────────┘                                               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │    1              0                Jan 2025           │  │
│  │   Posts       Followers            Created            │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────┬──────────────────────────────────────┤
│  [Recent] [Top]     │                                      │
│                     │    Trending Hashtags                  │
│  ┌───────────────┐  │    ├─ #africa                        │
│  │ Post Card     │  │    ├─ #diaspora                      │
│  │               │  │    └─ #gabacenter ← Current          │
│  └───────────────┘  │                                      │
│                     │                                      │
└─────────────────────┴──────────────────────────────────────┘
```

---

## 10. Technical Notes

### Dependencies
- No new dependencies required
- Uses existing Tailwind CSS classes
- Uses existing shadcn/ui components

### Performance Considerations
- Stats component should be lightweight
- Avoid layout shifts during data loading
- Use skeleton loaders during async operations

### Testing Requirements
- Unit tests for new components
- Visual regression tests
- Mobile device testing (iOS Safari, Android Chrome)
- Accessibility audit (WAVE, axe)

---

## 11. Open Questions

1. Should we show exact post/follower counts or use abbreviations (1.2K)?
2. Should the "Created" date link to anything or remain static?
3. Do we want to add trending indicators (↑ 23% this week)?
4. Should stats be clickable to show breakdowns?

---

## 12. Appendix

### A. Current Implementation Location
- `src/pages/dna/HashtagFeed.tsx` (lines 200-216)

### B. Related Components
- `src/components/feed/TrendingHashtags.tsx`
- `src/hooks/useHashtag.ts`
- `src/services/hashtagService.ts`

### C. DNA Design System References
- Primary: Forest Green `#1a472a`
- Secondary: Emerald `#2d5a3d`
- Accent: Copper `#b87333`
- Highlight: Gold `#d4af37`

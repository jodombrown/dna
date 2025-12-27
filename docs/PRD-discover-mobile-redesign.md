# PRD: Discover Page Mobile Redesign

**Version:** 1.0  
**Date:** 2025-01-27  
**Status:** Draft  
**Owner:** DNA Platform Team

---

## Executive Summary

Transform the `/dna/connect/discover` page into a native mobile-first experience that feels like LinkedIn with enhanced polish. The redesign focuses on compact information density, intuitive filtering, and subtle animations that add personality while maintaining professionalism.

---

## Goals & Success Metrics

### Primary Goals
1. **Native App Feel** - Users should not feel they're in a web browser
2. **Faster Discovery** - Reduce time to find relevant connections
3. **Higher Engagement** - Increase connection request rate

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Cards visible without scroll (mobile) | 1-2 | 3-4 |
| Time to apply first filter | ~5 taps | 2 taps |
| Filter usage rate | TBD | +30% |
| Connection request rate | TBD | +20% |

---

## User Research Insights

### Filter Priority (User Feedback)
Users primarily filter by:
1. **Focus Areas** (most used)
2. **Industries** 
3. **Country of Origin / Current Location**

These should be immediately accessible, not hidden.

### Card Density Preference
Users want to see **more cards per scroll** while maintaining information richness. The current cards are too tall for effective browsing.

### Animation Preference
**Subtle with personality** - Professional platform requires restraint, but micro-interactions add polish that differentiates DNA from generic platforms.

### Benchmark
**LinkedIn mobile app** - familiar patterns, but with enhanced visual polish and DNA's cultural identity.

---

## UX Requirements

### 1. Sticky iOS-Style Search Header

#### Experience Goal
Search feels native and stays accessible while scrolling. The blur effect creates depth and hierarchy.

#### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| S1 | Search bar sticks to top on scroll | P0 |
| S2 | Frosted glass backdrop blur effect | P0 |
| S3 | Search icon inside input (left-aligned) | P0 |
| S4 | Clear (X) button appears when text present | P0 |
| S5 | Cancel button appears on focus | P1 |
| S6 | 44px height (iOS Human Interface Guidelines) | P0 |
| S7 | 300ms debounced search with loading indicator | P0 |
| S8 | Smooth focus/blur transitions | P1 |

#### Acceptance Criteria
- [ ] Search bar remains visible when scrolling down 500px
- [ ] Backdrop blur is visible when content scrolls behind
- [ ] Typing "John" shows results within 500ms of stopping
- [ ] Tapping X clears search and shows all results
- [ ] Cancel button dismisses keyboard and clears focus

---

### 2. Horizontal Filter Pills

#### Experience Goal
Filters are immediately accessible via a swipeable pill row. Users can see active filters at a glance and tap to modify.

#### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Horizontal scrolling pill container | P0 |
| F2 | Pills for: Focus Areas, Industries, Country, Location | P0 |
| F3 | Active filter count badge on each pill | P0 |
| F4 | "All Filters" pill opens bottom sheet | P0 |
| F5 | Snap scrolling for clean stopping points | P1 |
| F6 | Tapping a pill opens quick selection popover | P1 |
| F7 | Staggered entrance animation on load | P1 |
| F8 | Pill color change animation on toggle | P2 |

#### Pill States
```
Inactive: bg-muted/50 border-border text-muted-foreground
Active:   bg-primary text-primary-foreground
```

#### Acceptance Criteria
- [ ] User can swipe horizontally to see all pills
- [ ] Selecting 2 focus areas shows badge "2" on Focus Areas pill
- [ ] Tapping "All Filters" opens bottom sheet
- [ ] Pills animate in on page load with 50ms stagger
- [ ] Active pills are visually distinct (color change)

---

### 3. Bottom Sheet for Advanced Filters

#### Experience Goal
Full filtering power accessible via a familiar bottom sheet pattern. Organized sections make complex filtering intuitive.

#### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| B1 | Bottom sheet using vaul Drawer component | P0 |
| B2 | Max height 85vh with scroll for content | P0 |
| B3 | Drag handle at top for dismissal | P0 |
| B4 | Sections: Regional Expertise, Focus Areas, Industries, Skills | P0 |
| B5 | Collapsible section headers | P1 |
| B6 | Two-column badge grid within sections | P0 |
| B7 | Sticky footer with Clear All + Apply buttons | P0 |
| B8 | Active filter count in header | P0 |
| B9 | Staggered animation for section content | P2 |

#### Acceptance Criteria
- [ ] Bottom sheet opens from bottom with spring animation
- [ ] User can drag down to dismiss
- [ ] Scrolling within sheet doesn't dismiss it
- [ ] "Apply (5 filters)" shows correct count
- [ ] "Clear All" resets all selections
- [ ] Filters apply immediately on "Apply" tap

---

### 4. Compact Member Cards

#### Experience Goal
See more potential connections per scroll while maintaining essential information. Cards feel premium with refined spacing.

#### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| C1 | Avatar size: 40x40px (down from 48x48) | P0 |
| C2 | Card padding: 12px uniform | P0 |
| C3 | Name: text-sm font-semibold | P0 |
| C4 | All secondary text: text-xs | P0 |
| C5 | Headline: single line, truncated | P0 |
| C6 | Tags: max 2 visible + "+X" overflow badge | P0 |
| C7 | Action buttons: height 28px | P0 |
| C8 | Match score indicator (subtle) | P1 |
| C9 | Touch feedback: scale(0.98) on press | P1 |

#### Card Height Target
- Current: ~160px
- Target: ~120px
- Result: 33% more cards visible

#### Acceptance Criteria
- [ ] 3-4 cards visible on iPhone 14 Pro without scrolling
- [ ] All essential info visible: name, headline, location, 2 tags
- [ ] Long headlines truncate with ellipsis
- [ ] Having 5 tags shows "2 visible + 3 more"
- [ ] Tapping card navigates to profile
- [ ] Connect button is clearly visible and tappable

---

### 5. Staggered Animations

#### Experience Goal
Cards feel alive and intentional. Animations add polish without slowing down the experience.

#### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| A1 | Card entrance: fade + slide up + subtle scale | P0 |
| A2 | Stagger delay: 80ms between cards | P0 |
| A3 | Spring physics: stiffness 400, damping 30 | P0 |
| A4 | Load More: new cards animate in smoothly | P1 |
| A5 | AnimatePresence for enter/exit | P1 |
| A6 | Respect reduced motion preferences | P0 |

#### Animation Variants
```typescript
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 30 
    }
  }
};
```

#### Acceptance Criteria
- [ ] First card appears immediately, subsequent cards stagger in
- [ ] Animation completes within 400ms for visible cards
- [ ] Loading more cards animates new cards, not existing ones
- [ ] Users with `prefers-reduced-motion` see no animations
- [ ] No jank or frame drops during animation

---

### 6. Skeleton Loading States

#### Experience Goal
Loading feels fast and intentional. Skeletons match final layout to prevent layout shift.

#### Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| L1 | Skeleton matches compact card layout exactly | P0 |
| L2 | Shimmer/pulse animation on skeleton | P1 |
| L3 | Show 4-6 skeletons during initial load | P0 |
| L4 | Skeletons also stagger in | P2 |
| L5 | Smooth transition from skeleton to real card | P1 |

#### Acceptance Criteria
- [ ] Skeletons appear within 50ms of page load
- [ ] Skeleton height matches real card height (no layout shift)
- [ ] Shimmer animation runs smoothly at 60fps
- [ ] Transition from skeleton to card is seamless

---

## Technical Architecture

### File Structure

```
src/
├── pages/dna/connect/
│   └── Discover.tsx                    # Main page (refactored)
│
├── components/connect/
│   ├── DiscoverSearchHeader.tsx        # NEW - iOS-style search
│   ├── DiscoverFilterPills.tsx         # NEW - Horizontal pills
│   ├── DiscoverFilterSheet.tsx         # NEW - Bottom sheet
│   ├── MemberCard.tsx                  # MODIFIED - Compact version
│   ├── MemberCardSkeleton.tsx          # NEW - Loading skeleton
│   └── DiscoverFilters.tsx             # DEPRECATED - Keep as reference
│
├── hooks/
│   └── useDiscoverMembers.ts           # NEW - Extract data logic
```

### Component Specifications

#### DiscoverSearchHeader.tsx
```typescript
interface DiscoverSearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}
```
- Uses `sticky top-0 z-40`
- Backdrop: `bg-background/80 backdrop-blur-md`
- Includes debounce logic internally

#### DiscoverFilterPills.tsx
```typescript
interface DiscoverFilterPillsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onOpenSheet: () => void;
  activeCount: number;
}
```
- Horizontal scroll container
- Individual pill components
- Badge count display

#### DiscoverFilterSheet.tsx
```typescript
interface DiscoverFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}
```
- Uses existing `Drawer` from vaul
- Internal state for pending filters
- Only applies on explicit "Apply" action

#### MemberCard.tsx (Modified)
```typescript
// Add motion wrapper
// Reduce sizes per requirements
// Accept animation variants as props
```

#### MemberCardSkeleton.tsx
```typescript
interface MemberCardSkeletonProps {
  // No props needed, matches MemberCard layout
}
```

### State Management

```typescript
// In Discover.tsx
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState<FilterState>({});
const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

// Derived
const activeFilterCount = useMemo(() => 
  countActiveFilters(filters), [filters]
);
```

### Animation Strategy

1. **Container Level** - Discover.tsx wraps card grid in `motion.div` with container variants
2. **Card Level** - Each MemberCard wrapped in `motion.div` with card variants
3. **Filter Pills** - Individual pills animate with stagger on mount
4. **Sheet Content** - Sections animate when sheet opens

### Performance Considerations

1. **Debounce Search** - 300ms to prevent excessive API calls
2. **Virtualization** - Consider `@tanstack/react-virtual` for very long lists (future)
3. **Animation Optimization** - Use `transform` and `opacity` only (GPU accelerated)
4. **Reduced Motion** - Check `prefers-reduced-motion` and skip animations

---

## Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Create `DiscoverSearchHeader.tsx`
- [ ] Create `MemberCardSkeleton.tsx`
- [ ] Update `Discover.tsx` layout structure

### Phase 2: Filtering (Day 2)
- [ ] Create `DiscoverFilterPills.tsx`
- [ ] Create `DiscoverFilterSheet.tsx`
- [ ] Integrate with existing filter state

### Phase 3: Cards & Animation (Day 3)
- [ ] Refactor `MemberCard.tsx` for compact design
- [ ] Add Framer Motion animations
- [ ] Add skeleton loading states

### Phase 4: Polish (Day 4)
- [ ] Micro-interactions (touch feedback, transitions)
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Cross-device testing

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab through filters and cards |
| Screen reader labels | Proper aria-labels on interactive elements |
| Reduced motion | Respect `prefers-reduced-motion` |
| Touch targets | Minimum 44x44px for all tappable elements |
| Color contrast | Meet WCAG AA standards |

---

## Open Questions

1. **Infinite scroll vs Load More?** - Start with Load More, consider infinite scroll as enhancement
2. **Filter persistence?** - Should filters persist in URL params for sharing?
3. **Pull to refresh?** - Native gesture for refreshing results?

---

## Appendix: Visual References

### Current State
- Tall cards (~160px)
- Filters take significant vertical space
- Basic search input
- No loading skeletons

### Target State
- Compact cards (~120px)
- Horizontal filter pills
- iOS-style sticky search
- Staggered card animations
- Skeleton loading states
- Bottom sheet for advanced filters

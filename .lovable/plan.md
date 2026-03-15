
Goal

Make mobile pages feel consistent and stop the repeated spacing regressions: no content bleeding into fixed headers, smaller but safe gaps, and the same scroll-hide behavior wherever a custom stacked mobile header is used.

What I found

1. Feed and Connect are not using the same mobile header system.
   - Feed hides the global header statefully and skips BaseLayout top padding.
   - Connect hides the global header visually, but BaseLayout still reserves mobile top padding for it.

2. That means Connect is currently double-accounting for top space on mobile.
   - BaseLayout adds `pt-14`
   - Connect also adds its own `pt-[6.5rem]`
   - This is the main reason spacing keeps feeling inconsistent.

3. Feed and Connect also use different hide/show rules.
   - Feed: `isScrollingDown && !isAtTop` with a threshold
   - Connect: just `isScrollingDown`
   - So Connect feels jumpier and less reliable.

4. The visible/hidden padding values are hardcoded per page instead of coming from one shared mobile spacing rule.
   - Feed: `pt-[6.5rem]` visible, `pt-[3rem]` hidden
   - Connect: `pt-[6.5rem]` visible, `pt-[0.5rem]` hidden

Implementation plan

1. Normalize BaseLayout for mobile custom-header routes
   - Update `src/layouts/BaseLayout.tsx` so Connect mobile routes skip the default mobile top padding the same way Feed already does.
   - This removes the double-gap problem at the layout level instead of chasing it page by page.

2. Make Connect use the same scroll-aware header behavior as Feed
   - Update `src/pages/dna/connect/Connect.tsx` to match Feed’s scroll logic:
     - use the same thresholded `useScrollDirection(...)`
     - only hide the header when scrolling down and not at the top
   - Keep the same fixed-header animation pattern used by Feed.

3. Unify the spacing contract for stacked mobile headers
   - Introduce one shared visible offset and one shared hidden offset for pages with:
     - top row header
     - second row tabs/filter bar
   - Apply the same values to Feed and Connect so they behave identically.
   - I will keep the spacing compact, but still large enough to fully clear both header rows.

4. Make the offsets reusable instead of hardcoded
   - Move the spacing values into a shared helper/constant so future mobile pages do not drift.
   - This prevents another round of manual `pt-[xrem]` edits.

5. Do a lightweight mobile consistency pass on related routes
   - Check pages that use dedicated mobile headers or fixed top content patterns:
     - Feed
     - Connect
     - Messages list/chat handoff
     - any route using `MobileViewContainer`
   - Only align top spacing rules where needed; avoid broad visual changes.

Technical details

Likely files to update:
- `src/layouts/BaseLayout.tsx`
- `src/pages/dna/Feed.tsx`
- `src/pages/dna/connect/Connect.tsx`
- optionally a new shared mobile spacing helper, for example:
  - `src/lib/mobileHeaderSpacing.ts`

Spacing model I’ll standardize:
```text
Mobile custom stacked header
= row 1 (main header)
+ row 2 (tabs/search/filter row)
+ a small safety buffer so content never bleeds
```

Behavior model I’ll standardize:
```text
At top: full header visible, content starts below both rows
Scrolling down: top row hides, second row shifts up, content keeps safe clearance
Scrolling up / near top: full header returns smoothly
```

Success criteria

- Feed and Connect look the same on mobile at the top.
- No card, banner, or first content block touches or slides under the fixed header area.
- Gaps feel tighter than now, but still clean.
- Header hide/reveal feels smooth and consistent on both pages.
- Future mobile pages can reuse one spacing rule instead of custom magic numbers.

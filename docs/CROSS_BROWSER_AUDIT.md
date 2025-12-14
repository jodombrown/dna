# DNA Platform — Cross-Browser Audit Report

**Audit Date:** December 14, 2025  
**Auditor:** Makena (AI Engineer)

---

## Executive Summary

Codebase audit identified **4 critical issues** and **8 moderate issues** that may cause cross-browser inconsistencies, particularly on iOS Safari and older Android devices.

---

## Critical Issues (Fix Before Launch)

### 1. ✅ FIXED: Dropdown/Popover z-index Too Low

**Files:** `dropdown-menu.tsx`, `popover.tsx`  
**Problem:** z-index was `z-50`, causing dropdowns to appear behind modals, sheets, and other overlays.  
**Fix Applied:** Increased to `z-[9999]` to ensure dropdowns always appear on top.

### 2. ✅ FIXED: Profile Completion Confetti Flickering

**Files:** `MobileProfileCompletionBanner.tsx`, `useProfileAccess.ts`  
**Problem:** Re-render loops caused by unmemoized hook values and state cascades when profile hits 100%.  
**Fix Applied:** Added useMemo to useProfileAccess, added refs to prevent re-trigger, reduced confetti particle count for mobile performance.

### 3. ✅ FIXED: Auth State Race Condition

**File:** `AuthContext.tsx`  
**Problem:** Login screen flickered due to `loading` being set to false before initial session check completed.  
**Fix Applied:** Added `isInitialized` state to ensure proper loading sequence.

### 4. ⚠️ NEEDS MONITORING: 100vh Usage on iOS Safari

**Files:** 126 files use `min-h-screen` or `100vh`  
**Problem:** iOS Safari's dynamic address bar causes `100vh` to be taller than the visible viewport, causing content to be cut off or requiring scroll.  
**Recommendation:** For critical full-screen layouts, consider using `dvh` (dynamic viewport height) or JavaScript-based height calculation.

**High-risk files to monitor:**
- `src/pages/Messages.tsx` — uses `h-[calc(100vh-140px)]`
- `src/layouts/FullCanvasLayout.tsx` — uses `height: 'calc(100vh - 64px)'`
- `src/pages/dna/MessagesInbox.tsx` — fixed inset layout

---

## Moderate Issues (Monitor During Beta)

### 5. Fixed Positioning on iOS Safari

**Affected Components:**
- `MobilePostButton.tsx` — fixed bottom-right FAB
- `FullCanvasLayout.tsx` — fixed sidebar overlay
- `SlashCommandMenu.tsx` — fixed floating menu
- `FloatingToolbar.tsx` — fixed floating toolbar

**Risk:** iOS Safari handles fixed positioning differently, especially when keyboard is open. Fixed elements may jump or get hidden.

**Recommendation:** Test thoroughly with keyboard open. Consider using `position: sticky` where possible.

### 6. Heavy Animations on Low-End Devices

**Affected Files:**
- `MobileProfileCompletionBanner.tsx` — confetti animation
- `Onboarding.tsx` — confetti animation
- `index.css` — bokeh drift animations

**Risk:** Older Android devices and older iPhones may struggle with multiple simultaneous animations.

**Recommendation:** Already mitigated by reducing confetti particle count. Monitor during beta.

### 7. Keyboard Overlap on Mobile Forms

**Risk Areas:**
- Onboarding steps with text inputs
- Profile edit forms
- Message composer

**Recommendation:** Test all input fields on iOS Safari and Android Chrome with keyboard visible. Ensure inputs scroll into view and aren't hidden.

### 8. Safe Area Insets (Notch/Home Bar)

**Existing Mitigation:** `index.css` has `safe-area-*` utility classes.

**Files Using Safe Area:**
- `index.css` defines utilities
- Need to verify all bottom-fixed elements use `safe-area-bottom`

**Recommendation:** Audit all fixed-bottom elements to ensure they respect safe-area-inset-bottom.

### 9. Date Picker Cross-Browser Differences

**Risk:** Native date inputs render differently across browsers. iOS Safari and Firefox have particularly different date picker UIs.

**Recommendation:** Test all date inputs (event creation, profile dates) across all browsers.

### 10. Touch Target Sizes

**Risk:** Small buttons/icons may be difficult to tap on mobile. WCAG recommends minimum 44x44px touch targets.

**High-Risk Components:**
- Close buttons (X icons)
- Reaction buttons
- Tab switchers

**Recommendation:** Audit touch target sizes on compact mobile UIs.

### 11. Select/Combobox Scrolling on iOS

**Risk:** Long dropdown lists may not scroll properly in iOS Safari if not using native select or properly configured Radix components.

**Recommendation:** Test country selectors and other long lists on iOS Safari.

### 12. Back Button Navigation (Android)

**Risk:** Android hardware back button may close modals unexpectedly or navigate away from the app instead of going back in history.

**Recommendation:** Test all modal/sheet interactions with Android back button.

---

## Z-Index Hierarchy (Reference)

Current z-index hierarchy in the codebase:

| Layer | z-index | Components |
|-------|---------|------------|
| Toasts | 10000 | toast.tsx, select.tsx |
| Dialogs | 9998-9999 | dialog.tsx |
| Dropdowns/Popovers | 9999 | dropdown-menu.tsx, popover.tsx |
| Sheets | 999-1002 | sheet.tsx |
| Waitlist Popup | 9999 | WaitlistPopup.tsx |
| Event Header | 100 | EventNavigationHeader.tsx |
| Sticky Navigation | 40-50 | PhaseHero.tsx, general fixed elements |
| Mobile FAB | 40 | MobilePostButton.tsx |

---

## Browser-Specific CSS Considerations

### iOS Safari
```css
/* Use for full-height layouts */
height: 100dvh; /* dynamic viewport height - accounts for address bar */

/* Prevent zoom on input focus */
input, textarea, select {
  font-size: 16px; /* iOS zooms if font-size < 16px */
}

/* Safe area for notch/home bar */
padding-bottom: env(safe-area-inset-bottom);
```

### Android Chrome
```css
/* Ensure tap highlight doesn't interfere */
-webkit-tap-highlight-color: transparent;
```

### Firefox
```css
/* Scrollbar styling differs */
scrollbar-width: thin;
scrollbar-color: var(--muted) transparent;
```

---

## Testing Priority Matrix

| Feature | iOS Safari | iOS Chrome | Android | Desktop | Priority |
|---------|------------|------------|---------|---------|----------|
| Auth Flow | 🔴 Critical | 🔴 Critical | 🔴 Critical | 🟡 Medium | P0 |
| Onboarding | 🔴 Critical | 🟡 Medium | 🔴 Critical | 🟡 Medium | P0 |
| Profile 100% Confetti | 🔴 Critical | 🔴 Critical | 🔴 Critical | 🟡 Medium | P0 |
| Feed Scrolling | 🔴 Critical | 🟡 Medium | 🔴 Critical | 🟢 Low | P1 |
| Messaging | 🔴 Critical | 🟡 Medium | 🔴 Critical | 🟡 Medium | P1 |
| Story Editor | 🟡 Medium | 🟡 Medium | 🟡 Medium | 🟢 Low | P2 |

---

## Next Steps

1. ✅ Critical z-index and confetti fixes already applied
2. 🔜 Run full QA checklist on iOS Safari first (highest risk)
3. 🔜 Monitor beta feedback for additional cross-browser issues
4. 🔜 Consider adding `100dvh` for critical full-screen layouts if iOS Safari issues reported

---

*Report generated: December 14, 2025*

# DNA Platform — Beta QA Checklist

**Version:** 1.0  
**Beta Period:** December 15, 2025 – January 15, 2026  
**Owner:** QA / Beta Testing Team

---

## How to Use This Checklist

Test each item on **all target devices/browsers**. Mark as:
- ✅ Pass
- ❌ Fail (add bug description)
- ⚠️ Partial (works but with issues)
- ⏭️ Not Applicable

---

## Target Devices & Browsers

### Mobile (Priority 1)
| Device | Browser | Tester | Status |
|--------|---------|--------|--------|
| iPhone (iOS 16+) | Safari | | |
| iPhone (iOS 16+) | Chrome | | |
| Android (12+) | Chrome | | |
| Android (12+) | Samsung Internet | | |

### Desktop (Priority 2)
| OS | Browser | Tester | Status |
|----|---------|--------|--------|
| macOS | Safari | | |
| macOS | Chrome | | |
| Windows | Chrome | | |
| Windows | Edge | | |
| Windows | Firefox | | |

---

## 1. Authentication Flow

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| Sign up with email works | | | | |
| Login with existing account works | | | | |
| Login screen does NOT flicker | | | | |
| "Forgot password" flow works | | | | |
| Logout works and clears session | | | | |
| Protected routes redirect to /auth | | | | |

---

## 2. Onboarding Flow (New Users)

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| All 4 steps load correctly | | | | |
| Step navigation (Next/Back) works | | | | |
| Avatar upload works | | | | |
| Country selectors work (scrollable, searchable) | | | | |
| Username validation shows errors | | | | |
| Confetti plays on completion (no flickering) | | | | |
| Redirects to /dna/feed after completion | | | | |
| Keyboard doesn't overlap input fields | | | | |

---

## 3. Profile Completion & Edit

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| Profile completion banner shows (< 100%) | | | | |
| Progress bar updates correctly | | | | |
| Banner auto-hides after 30 seconds | | | | |
| Confetti at 100% (first time only, no flicker) | | | | |
| /dna/profile/edit loads correctly | | | | |
| All form sections are accessible | | | | |
| Image uploads work (avatar, banner) | | | | |
| Save changes persists data | | | | |
| Profile view shows updated info | | | | |

---

## 4. Feed (Home)

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| Feed loads with posts | | | | |
| Tab switching works (All, For You, etc.) | | | | |
| Tab explainers show (once per day/session) | | | | |
| Post creation works | | | | |
| Link previews render correctly | | | | |
| Video embeds play | | | | |
| Image attachments display | | | | |
| Reactions work (like, etc.) | | | | |
| Comments expand in-place | | | | |
| Commenting works | | | | |
| Infinite scroll / pagination | | | | |
| Pull-to-refresh (mobile) | | | | |

---

## 5. Connect (Discovery & Connections)

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| /dna/connect loads | | | | |
| Member discovery shows profiles | | | | |
| Filters work (location, skills, etc.) | | | | |
| Send connection request works | | | | |
| Accept/Decline connection works | | | | |
| View public profile works | | | | |
| Block/Report user works | | | | |

---

## 6. Convey (Stories)

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| /dna/convey loads | | | | |
| Story cards display correctly | | | | |
| "Read Full Story" expands in-place | | | | |
| Story type filters work | | | | |
| Story creation (all types) works | | | | |
| Rich text editor works | | | | |
| Image/video embedding works | | | | |
| Save draft / publish works | | | | |

---

## 7. Messaging

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| /dna/messages loads | | | | |
| Conversation list displays | | | | |
| Opening a conversation works | | | | |
| Sending messages works | | | | |
| Receiving messages updates in real-time | | | | |
| Unread badges update | | | | |
| Back navigation (mobile) works | | | | |
| Message input doesn't get hidden by keyboard | | | | |

---

## 8. Notifications

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| Bell icon shows unread count | | | | |
| Dropdown shows notifications | | | | |
| Clicking notification navigates correctly | | | | |
| Mark as read works | | | | |
| Clear notifications works | | | | |

---

## 9. Settings

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| /dna/settings loads | | | | |
| Privacy toggles work | | | | |
| Notification preferences save | | | | |
| Account settings accessible | | | | |
| Logout works | | | | |

---

## 10. Cross-Browser Visual Issues

| Issue Type | iOS Safari | iOS Chrome | Android | Desktop |
|------------|------------|------------|---------|---------|
| Dropdowns appear above content (not see-through) | | | | |
| Modals/dialogs centered and scrollable | | | | |
| Fixed headers don't overlap content | | | | |
| No horizontal scrolling on any page | | | | |
| Text is readable (contrast, size) | | | | |
| Buttons are tappable (44px+ touch target) | | | | |
| Animations are smooth (no jank) | | | | |

---

## 11. PWA / Install Experience

| Test Case | iOS Safari | iOS Chrome | Android | Desktop |
|-----------|------------|------------|---------|---------|
| /install page loads | | | | |
| Add to Home Screen works | | | | |
| App opens from home screen | | | | |
| App works offline (basic) | | | | |

---

## 12. Known iOS Safari Quirks to Verify

| Issue | Status | Notes |
|-------|--------|-------|
| 100vh doesn't cause layout shift on scroll | | |
| Keyboard doesn't push fixed elements off-screen | | |
| Date picker works correctly | | |
| Safe area insets respected (notch, home bar) | | |
| Back gesture doesn't break navigation | | |

---

## 13. Known Android Quirks to Verify

| Issue | Status | Notes |
|-------|--------|-------|
| Hardware back button works correctly | | |
| Keyboard doesn't overlap inputs | | |
| Share sheet works | | |
| PWA install prompt appears | | |

---

## Bug Report Template

When reporting bugs, include:

```
**Device:** [e.g., iPhone 14, iOS 17.2]
**Browser:** [e.g., Safari, Chrome 120]
**Page/Route:** [e.g., /dna/profile/edit]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Screenshot/Video:** [attach if possible]
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Engineering Lead | | | |
| Product Owner | | | |

---

*Document generated: December 14, 2025*

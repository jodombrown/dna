# Homepage header fix, card swap, and FAQ rewrite

## 1. Mobile menu: About should navigate away

In the signed-out mobile menu, "Sign up" and "Sign In" close the menu before navigating, but "About" only navigates, so the drawer stays open over the About page.

Fix: close the menu, then navigate, matching the Sign up handler exactly. Same check applied to the public site header's mobile drawer so both behave identically.

## 2. Building Together section: remove one card, move the other in

- Delete the "Learn About DNA / Learn More" card.
- Move the "The African Diaspora Movement Starts Here" CTA block out of the FAQ section and into that slot, so the row reads: Share Feedback, then the movement CTA.
- Retitle it to "African Diaspora Mobilization Starts Here".
- Keep the existing "Sign up" button behavior (goes to /auth?mode=signup).

## 3. FAQ section rewrite

Heading stays "Who is DNA for?", with a small "FAQ" eyebrow above it.

New subhead, replacing the current one:

> Diaspora, Continental Partners, and Allies building Africa's progress together, wherever they live.

The five existing questions are replaced with the ten supplied questions and answers, verbatim, in order (What is DNA, Who is DNA for, Do I have to move to Africa, What does Membership mean, Is there a cost, How is DNA different, What can I actually do, Does DNA touch my money, I'm not of African descent, What if I'm not sure where to start).

Closing line under the last accordion item:

> Still have questions? Reach out or Affirm your Membership and ask from inside.

"Reach out" opens mailto:support@diasporanetwork.africa. "Affirm your Membership" goes to /auth?mode=signup.

The accordion open/close behavior, spacing, and card styling stay as they are. Nothing else on the homepage changes.

## Technical notes

- `src/components/UnifiedHeader.tsx`: add `setIsMobileMenuOpen(false)` to the About handler.
- `src/components/PublicSiteHeader.tsx`: confirm the About item runs through the existing `go()` helper that closes the sheet; wire it if not.
- `src/components/BuildingTogetherSection.tsx`: drop the Learn About DNA card, add the mobilization CTA card, remove the now-unused `BookOpen` import and `navigate` if it becomes dead.
- `src/components/WhoIsDNAForSection.tsx`: replace the `faqs` array with the ten items, update eyebrow/subhead, remove the CTA block that moved out, add the closing line.
- Copy contains no em dashes. Existing typography tokens and `dna-*` colors are reused; no new tokens.

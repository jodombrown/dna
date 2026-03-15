

## Problem

The current sponsorship system has a fragile logo setup: the GABA Center's `logo_url` in the database points to `https://www.gabacenter.com/assets/gaba-logo.png` (a 404), forcing us to maintain hardcoded fallback mappings in code. The admin form only accepts a URL for the logo, with no file upload capability. This means any sponsor with a broken or missing logo URL will display incorrectly.

Your instinct is right: we need a proper sponsorship portal where you can **upload** the actual logo file, fill in all sponsor details, preview the card exactly as it will appear, and then approve/publish it to a specific placement zone.

## Proposed Solution: Enhanced Sponsorship Portal

### 1. Logo Upload (not just URL)

Upgrade the Sponsor Form to support **direct logo file upload** to Supabase Storage (a `sponsor-logos` bucket), in addition to the existing URL option. The uploaded file gets stored reliably in your own infrastructure, so logos never break due to external sites changing their asset paths.

### 2. Live Card Preview

Add a **real-time preview panel** next to the sponsor/placement form that renders the exact `FeedSponsorCard` (or other placement-specific card) as you fill in the fields. You see exactly what users will see before you hit save.

### 3. Placement Zone Selector with Visual Map

Replace the current raw dropdown (`feed_sidebar`, `event_page`, etc.) with a **visual placement picker** showing labeled zones on a simplified page wireframe, so it is clear where each sponsor card will appear.

### 4. Approval Workflow

Add a `status` field to placements: `draft` | `active` | `paused`. New placements start as **draft**, letting you fill everything in, preview, and then explicitly **publish** when ready. The public query already filters by `is_active`, so drafts never leak to users.

### 5. Route: Keep at `/app/admin/sponsorships`

The existing admin route is already wired and protected. No need for a separate `/dna/sponsors` public route since this is an admin function. We will enhance the existing page rather than creating a new one.

## Technical Changes

### Database
- Create a `sponsor-logos` storage bucket (public, for logo serving)
- Add `status` column to `sponsor_placements` (`draft`/`active`/`paused`), default `draft`
- Update the `getActivePlacements` query to filter `status = 'active'`

### Sponsor Form Upgrades (`SponsorshipManagement.tsx`)
- Add file input with drag-and-drop for logo upload (using existing `uploadMedia` pattern but targeting the new `sponsor-logos` bucket)
- Show thumbnail preview of uploaded logo
- Auto-generate slug from name
- Remove the hardcoded `SPONSOR_LOGO_FALLBACKS` map from `FeedSponsorCard.tsx` since logos will be reliably stored

### Live Preview Panel
- New `SponsorCardPreview` component that takes form state and renders the card in real-time
- Shown side-by-side with the form in the dialog (or in a dedicated panel)

### Placement Form Upgrades
- Visual zone picker replacing raw text dropdown
- Status toggle: Draft / Active / Paused
- Date range pickers for `starts_at` / `ends_at`

### Cleanup
- Remove `SPONSOR_LOGO_FALLBACKS` from `FeedSponsorCard.tsx`
- Update `FeedSponsorCard` to trust the database `logo_url` (since it will now point to Supabase Storage)
- Fix GABA Center's `logo_url` in the database to point to the newly uploaded file

### Flow Summary

```text
Admin visits /app/admin/sponsorships
  -> Clicks "Add Sponsor"
  -> Uploads logo file (stored in Supabase Storage)
  -> Fills in name, description, website, tier, contact info
  -> Sees live preview of the sponsor card
  -> Saves sponsor
  -> Clicks "Add Placement"
  -> Picks zone (feed sidebar, event page, etc.) from visual picker
  -> Fills headline, CTA label, CTA URL
  -> Sees live preview of the card in that zone's format
  -> Saves as Draft
  -> Reviews -> Publishes (status -> active)
  -> Card appears on the live site with correct logo and info
```


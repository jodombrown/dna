# Fix the Contribute need card: body weight and missing media

The card in the screenshot is `OpportunityFeedCard` (Contribute · Need). Two defects, both confirmed in the file:

1. The whole body is rendered as one semibold paragraph (`font-semibold`, plus an off-scale `text-[15px]`), so a long grant description reads as a wall of bold text.
2. The card renders no media at all. There is no image, gallery, or link-preview block, so an attached image or a pasted link URL never appears. StoryCard and EventCard already render these through `CardMedia`; Contribute was never wired up.

There is also no expand control on this card, so a long body has no ceiling: it just runs until the card ends.

## What changes

In `src/components/feed/cards/OpportunityFeedCard.tsx` only:

- Replace the bold body paragraph with the shared `ExpandableProse` block, at normal weight, muted foreground, with the Contribute accent on the Read more control. Same body treatment every other card already uses.
- Add media, in the same order and shape StoryCard uses, above the body:
  - hero image from `media_url`, inside `CardMedia`, fixed band height
  - gallery strip when `gallery_urls` has entries
  - `LinkPreviewCard` (compact) when `link_url` is present, so a pasted video or article link shows a preview instead of a bare link
- Keep the header, the currency pill, the give / for / impact proof block, and the action row exactly as they are.

## Technical notes

- Body: `<ExpandableProse content={item.content} accentClassName="text-bevel-opportunity" className="mb-3 text-body leading-relaxed text-muted-foreground" />`, which drops the `text-[15px]` bracket value the design-system gate bans.
- `linkifyContent` is no longer called directly by this card (ExpandableProse handles it); its import gets removed if unused.
- No data or RPC change: `media_url`, `gallery_urls`, `link_url`, and `link_metadata` are already on `UniversalFeedItem` and already returned by the feed query, which is why StoryCard can read them.

## Verification

- Render the Contribute need post from the screenshot at 402px: body at normal weight with a Read more control, image visible if one was attached, link preview if a URL was posted.
- Check 768px and 1440px for the same card.
- Confirm no bracket values or banned Tailwind sizes entered the file.

Only one file is touched. If the post in the screenshot turns out to have no image attached and no link in its content, the missing-image half is a composer/storage question rather than a card question, and I will say so rather than claim it fixed.

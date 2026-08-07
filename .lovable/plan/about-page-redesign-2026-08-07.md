# About page redesign

One file: `src/pages/About.tsx`. Full rebuild of the page onto brand tokens, with the sections you named removed, added, or rewritten.

## What changes

**1. Left accent bars removed.** The copper and green `border-l-4` stripes on the Mission card, Vision card, and the founder quote card come off. Separation comes from a hairline border and the warm cream surface, not a coloured spine. This also matches the "no accent stripes" rule already locked for cards elsewhere in the product.

**2. Hero shows the logo, not the word.** The `About DNA` headline drops the copper "DNA" text. The transparent DNA logo renders in its place at a controlled height, with the headline reading as a real sentence beneath it: "We are the mobilization infrastructure for the Global African Diaspora's return." No gradient wash behind it; flat cream ground.

**3. Meet the founder, rebuilt.** Becomes the strongest block on the page:

- Two-column on desktop, stacked on mobile, photo left at a squarer crop with a hairline frame rather than a heavy drop shadow.
- Name, then role, then the bio in two short scannable paragraphs.
- An explicit, labelled LinkedIn action instead of a bare icon: a bordered button reading "Connect with Jaûne on LinkedIn" with the LinkedIn glyph, sized to a 44px target, opening in a new tab. Nobody has to guess the icon is clickable.
- The pull-quote sits under the bio as a plain indented quote with a hairline rule, no card, no gradient fill.
- add a link to my DNA profile as well - [https://diasporanetwork.africa/dna/jaunelamarro](https://diasporanetwork.africa/dna/jaunelamarro)

**4. "How DNA Works" section deleted.** The three Connect / Collaborate / Contribute pillar cards go away entirely, along with the bullet lists. The Five C's are already explained on the homepage.

**5. Core values, rebuilt without Adinkra.** Adinkra is reserved for the C nav, so `MateMasie` comes out of the Innovation slot. Values move from three centered icon-in-a-pastel-circle cards (the exact pattern the design rules forbid) to a numbered, left-aligned three-column list: a small numeral, the value name, one tight sentence. Values kept as Unity, Innovation, Impact with sharper copy. No lifting hover transforms, no shadow escalation; hover is a border colour shift only.

**6. Page rhythm and type.** Every size moves onto the canonical scale (`hero`, `display`, `h1`, `h2`, `h3`, `body`, `meta`, `micro`) so nothing renders at an inherited size. Sections cap at `py-12`. Density varies deliberately: hero is spacious, values is dense, the founder block is the wide one, the closing call to action is nearly empty.

**7. Origin story block added.** A short, left-aligned "Why DNA exists" passage between the hero and the values, written as the founding problem rather than company history. Two paragraphs, no card.

**8. Closing call to action, single.** One primary action ("Request access") plus a quiet text link to Contact. The current two heavy shadowed buttons and the gradient band go.

## On social proof

The AI Overview you pasted calls for testimonials, press mentions, and key statistics. Two of those three I will not invent: there are no real testimonials or press mentions to cite, and fabricating them is off the table. For the statistic slot the page will pull from the existing sourced stat citations already used on the homepage (remittances, diaspora population), each rendered with its real source line, so the number on the page is attributable. If you have real testimonials or press to add, send them and they go in as a fourth block.

## Technical notes

- Single file touched: `src/pages/About.tsx`.
- Logo via the existing `src/assets/dna-logo.png` import, given explicit width and height so it does not shift layout.
- Colour only through `dna-emerald`, `dna-copper`, `dna-forest` and the semantic tokens. No hex, no bracket values, no new tokens.
- Founder photo path unchanged.
- `JoinDNADialog`, `SurveyDialog`, `PageSEO`, `Footer`, and both structured-data blocks stay as they are.
- Removed imports cleaned up: `Users`, `Lightbulb`, `Heart`, `Target`, `MateMasie`, and the `Badge` if it ends up unused.
- Verified at 360px, 768px, 1440px, with visible keyboard focus on the LinkedIn action and both calls to action.
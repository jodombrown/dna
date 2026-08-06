# Fix the Five C's cards on the public framework section

## What is actually wrong

The cards in your screenshot are rendered by `src/components/platform/HeroTriangleSection.tsx`. That file was never brought onto the identity system, so it still carries the pre-palette, pre-Adinkra markup:

- Icons are stock Lucide: `Users`, `Calendar`, `Handshake`, `Heart`, `Newspaper`. No Adinkra import exists in the file, so the Five C's identity glyphs (Sankofa, Nkonsonkonson, Funtunfunefu Denkyemfunefu, Adinkrahene, Mpatapo) are simply absent here.
- Colors come from the retired `dna-*` names, not the locked C palette, and two are assigned to the wrong C: Collaborate is painted copper (that ink belongs to Convene) and Contribute is painted emerald/mint (that ink belongs to Connect). Convey is ochre/gold, which is Contribute's gold. So three of five C's are wearing another C's colour.
- Each tile is a two-stop gradient with `text-white` and a `hover:scale-105` lift, all of which the design rules refuse.

Confirmed in this codebase: the locked `--c5-*` ramp exists in `src/index.css` and is exposed in `tailwind.config.ts` as `c5.<c>` and `c5.<c>.text`, so the correct values are already available as tokens. Nothing new needs to be added to the token layer.

## What I will change

One file: `src/components/platform/HeroTriangleSection.tsx`.

1. Replace the five Lucide module icons with the Adinkra icons from `@/components/icons/adinkra`, in Five C's order: Sankofa for Connect, Nkonsonkonson for Convene, Funtunfunefu Denkyemfunefu for Collaborate, Adinkrahene for Contribute, Mpatapo for Convey. `ArrowDown` stays: it is utility, not identity.
2. Replace the gradient tiles with a flat single-C surface using that C's own token, and drop `text-white` in favour of a token foreground.
3. Repoint every colour reference to `c5.<c>` / `c5.<c>.text` so each C wears only its own ink. No `dna-sunset`, `dna-copper`, `dna-mint`, `dna-ochre`, `dna-gold` left in the file.
4. Remove `hover:scale-105` and the icon `group-hover:scale-110`; hover becomes a border and colour shift only.
5. Collapse the five hand-copied button blocks into one map over a local ordered array of the five C's so the set cannot drift again. Copy stays exactly as it reads today.
6. Move the banned Tailwind default sizes in this block (`text-xl`, `text-sm`) onto the project scale and drop the reflex `font-bold`.

## Notes

- The Adinkra usage guard runs against a baseline (`scripts/.adinkra-baseline.json`). Adding a legitimate Five C identity surface means that baseline needs regenerating in the same change, otherwise CI reads the new imports as decoration. I will run the script's `--update` path and include the result.
- Scope boundary: the five long sections below this row (`ConnectSection`, `ConveneSection`, `CollaborateSection`, `ContributeSection`, `ConveySection`) each still import Lucide and still use `dna-*` colours. They are a separate pass and I will not touch them here unless you say so.

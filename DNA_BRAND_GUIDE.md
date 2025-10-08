# DNA Brand Identity & Color Palette Guide

## Brand Philosophy

**Diaspora Network of Africa (DNA)** represents connection, heritage, and forward momentum. Our visual identity draws from:
- **African landscapes**: Earth tones, rich forests, vibrant sunsets
- **Cultural authenticity**: Copper, gold, and traditional textiles
- **Modern professionalism**: Clean neutrals, accessible contrast
- **Ubuntu philosophy**: Warmth, community, interconnection

---

## Core Brand Colors

### Primary Palette (Use for main UI elements)

**Forest Green** - Our anchor color representing growth and African landscapes
- `dna-forest`: Primary brand color for headers, CTAs, navigation
- `dna-forest-light`: Hover states, subtle backgrounds
- `dna-forest-dark`: Text on light backgrounds, emphasis

**Emerald** - Energy, innovation, and forward momentum
- `dna-emerald`: Secondary CTAs, success states, active elements
- `dna-emerald-light`: Highlights, badges
- `dna-emerald-dark`: Borders, active states

**Copper** - Heritage, warmth, and diaspora connection
- `dna-copper`: Accent color for links, highlights, interactive elements
- `dna-copper-light`: Soft backgrounds, cards
- `dna-copper-dark`: Emphasized text, icons

**Gold** - Excellence, achievement, and value
- `dna-gold`: Achievements, premium features, important highlights
- `dna-gold-light`: Badge backgrounds, subtle accents
- `dna-gold-dark`: Premium text, special designations

---

## Extended Palette (Use for variety and visual interest)

**Mint** - Fresh perspectives, collaboration
- `dna-mint` / `dna-mint-light` / `dna-mint-dark`

**Crimson** - Passion, urgent actions, important alerts
- `dna-crimson` / `dna-crimson-light` / `dna-crimson-dark`

**Earth** - Grounding, stability, foundation
- `dna-earth` / `dna-earth-light` / `dna-earth-dark`

**Sand** - Warmth, accessibility, neutrality
- `dna-sand` / `dna-sand-light` / `dna-sand-dark`

**Ocean** - Depth, knowledge, exploration
- `dna-ocean` / `dna-ocean-light` / `dna-ocean-dark`

**Sunset** - Transformation, innovation, inspiration
- `dna-sunset` / `dna-sunset-light` / `dna-sunset-dark`

---

## Neutral Tones (Use for text, backgrounds, structure)

**Slate** - Primary text, headings, structure
- `dna-slate` / `dna-slate-light` / `dna-slate-dark`

**Pearl** - Light backgrounds, cards, subtle dividers
- `dna-pearl` / `dna-pearl-light` / `dna-pearl-dark`

**Charcoal** - Dark mode, heavy text, contrast
- `dna-charcoal` / `dna-charcoal-light` / `dna-charcoal-dark`

---

## Semantic Colors (Use for system states)

- `dna-success`: Confirmations, completed actions
- `dna-warning`: Cautions, important notices
- `dna-error`: Errors, destructive actions
- `dna-info`: Informational messages, tips

---

## Regional & Cultural Colors

### North Africa Regional Palette
- `north-africa-sand`
- `north-africa-terracotta`
- `north-africa-desert`
- `north-africa-oasis`

### Country Flag-Inspired Colors
Available for Morocco, Egypt, Algeria, Tunisia, Libya, and Sudan.  
Use these sparingly for country-specific features or regional events.

---

## Usage Guidelines

### ✅ DO:

```tsx
// Use semantic tokens from the design system
<div className="bg-dna-forest text-dna-pearl">
  <h1 className="text-dna-gold">Welcome</h1>
  <p className="text-dna-copper">Connect with diaspora</p>
</div>

// Use variants for different contexts
<Button variant="primary">      // Uses dna-forest
<Button variant="secondary">    // Uses dna-emerald
<Button variant="accent">       // Uses dna-copper
```

### ❌ DON'T:

```tsx
// Never use hardcoded colors
<div className="bg-green-500 text-white">  ❌
<div className="bg-[#10b981]">             ❌

// Never use direct hex/rgb values
style={{ backgroundColor: '#10b981' }}     ❌
```

---

## Implementation Rules

### 1. **Always Use HSL Format**
All DNA colors are defined in HSL in `index.css` and accessed via CSS variables in `tailwind.config.ts`.

### 2. **Use Tailwind Semantic Tokens**
Reference colors through the design system:
- `text-dna-forest` instead of `text-green-800`
- `bg-dna-copper` instead of `bg-orange-500`
- `border-dna-emerald` instead of `border-emerald-600`

### 3. **Leverage Light/Dark Variants**
Each color has `-light` and `-dark` variants for depth:
```tsx
<div className="bg-dna-forest hover:bg-dna-forest-dark">
  <span className="text-dna-forest-light">Hover me</span>
</div>
```

### 4. **Create Component Variants, Not One-Offs**
When you need a specific style repeatedly, add it to the component variant system:

```tsx
// In button.tsx
const buttonVariants = cva("...", {
  variants: {
    variant: {
      forest: "bg-dna-forest text-dna-pearl hover:bg-dna-forest-dark",
      copper: "bg-dna-copper text-white hover:bg-dna-copper-dark",
      // ... more variants
    }
  }
})
```

---

## Color Pairing Examples

### High Contrast (Accessibility)
- `bg-dna-forest` + `text-dna-pearl`
- `bg-dna-charcoal` + `text-dna-mint-light`
- `bg-white` + `text-dna-forest-dark`

### Warm & Inviting
- `bg-dna-sand-light` + `text-dna-copper-dark`
- `bg-dna-earth-light` + `text-dna-gold-dark`

### Professional & Clean
- `bg-dna-pearl-light` + `text-dna-slate-dark`
- `bg-white` + `text-dna-charcoal`

### Energetic & Modern
- `bg-dna-emerald` + `text-white`
- `bg-dna-mint-light` + `text-dna-ocean-dark`

---

## Common Patterns

### Headers & Navigation
```tsx
<header className="bg-dna-forest text-dna-pearl">
  <nav className="border-b border-dna-forest-light">
    <a className="text-dna-copper hover:text-dna-gold">Link</a>
  </nav>
</header>
```

### Cards & Containers
```tsx
<div className="bg-dna-pearl-light border border-dna-slate-light rounded-lg">
  <h3 className="text-dna-forest-dark">Card Title</h3>
  <p className="text-dna-slate">Card content</p>
</div>
```

### Call-to-Action Buttons
```tsx
<Button className="bg-dna-emerald hover:bg-dna-emerald-dark text-white">
  Join the Network
</Button>
```

### Status Indicators
```tsx
<Badge className="bg-dna-success">Active</Badge>
<Badge className="bg-dna-warning">Pending</Badge>
<Badge className="bg-dna-error">Inactive</Badge>
```

---

## Accessibility Requirements

1. **Minimum Contrast**: 4.5:1 for normal text, 3:1 for large text
2. **Test Dark Mode**: Ensure all color pairings work in both themes
3. **Never Rely on Color Alone**: Use icons, labels, or patterns alongside color
4. **Avoid Pure Red/Green**: Use `dna-error` and `dna-success` instead

---

## Quick Reference Cheat Sheet

| Use Case | Color Token |
|----------|-------------|
| Primary CTA | `bg-dna-forest` or `bg-dna-emerald` |
| Links | `text-dna-copper hover:text-dna-gold` |
| Headings | `text-dna-forest-dark` or `text-dna-charcoal` |
| Body text | `text-dna-slate` or `text-dna-charcoal-light` |
| Backgrounds | `bg-dna-pearl-light` or `bg-white` |
| Borders | `border-dna-slate-light` |
| Success state | `bg-dna-success` or `text-dna-success` |
| Error state | `bg-dna-error` or `text-dna-error` |
| Accent highlights | `bg-dna-gold-light` or `border-dna-copper` |

---

## Questions?

If you need a color combination not covered here or want to propose a new variant, check:
1. `src/index.css` - Color variable definitions
2. `tailwind.config.ts` - Tailwind integration
3. Component variant definitions in `src/components/ui/`

**Remember**: The goal is consistency, accessibility, and cultural authenticity. When in doubt, use the core palette (forest, emerald, copper, gold) and neutral tones.

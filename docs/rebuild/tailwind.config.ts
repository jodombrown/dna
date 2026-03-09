/**
 * DNA Platform — Production Tailwind Config for Rebuild
 * 
 * Generated from existing codebase audit (March 2026).
 * Every token sourced from index.css + tailwind.config.ts + design system PRD.
 * 
 * USAGE: Drop this into a fresh Lovable/Vite project as tailwind.config.ts
 */

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    /* ─── BREAKPOINTS ─── */
    screens: {
      xs: "375px",   // Small phones
      sm: "640px",   // Large phones / small tablets
      md: "768px",   // Tablets
      lg: "1024px",  // Small desktops / landscape tablets
      xl: "1280px",  // Desktops
      "2xl": "1536px", // Large desktops
    },

    extend: {
      /* ═══════════════════════════════════════════
         FONT FAMILIES
         ═══════════════════════════════════════════ */
      fontFamily: {
        // Primary UI font — all body, buttons, inputs, nav, metadata
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        ui: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        // Heritage font — display, H1, H2, profile names, stat numbers, DIA insights
        serif: ["Lora", "Georgia", "Times New Roman", "serif"],
        heritage: ["Lora", "Georgia", "Times New Roman", "serif"],
        // Monospace — code blocks, technical content
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },

      /* ═══════════════════════════════════════════
         FONT SIZES (with line-height + letter-spacing)
         
         Heritage (Lora): display, h1, h2, stat-*
         UI (Inter): h3+, body, button, input, caption, overline
         ═══════════════════════════════════════════ */
      fontSize: {
        // Display — hero moments, onboarding (Lora)
        "display": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "display-sm": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],

        // Headings
        "h1": ["28px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],       // Lora
        "h1-sm": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],    // Lora mobile
        "h2": ["22px", { lineHeight: "1.3", letterSpacing: "0" }],             // Lora
        "h2-sm": ["20px", { lineHeight: "1.3", letterSpacing: "0" }],          // Lora mobile
        "h3": ["18px", { lineHeight: "1.4", letterSpacing: "0" }],             // Inter
        "h3-sm": ["17px", { lineHeight: "1.4", letterSpacing: "0" }],          // Inter mobile
        "h4": ["18px", { lineHeight: "1.4", letterSpacing: "0" }],             // Inter
        "h5": ["16px", { lineHeight: "1.5", letterSpacing: "0" }],             // Inter
        "h6": ["14px", { lineHeight: "1.5", letterSpacing: "0" }],             // Inter

        // Body text (Inter)
        "body-lg": ["17px", { lineHeight: "1.6", letterSpacing: "0" }],
        "body": ["15px", { lineHeight: "1.55", letterSpacing: "0" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "0" }],

        // Functional (Inter)
        "caption": ["12px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        "overline": ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        "button": ["15px", { lineHeight: "1.2", letterSpacing: "0.01em" }],
        "input": ["16px", { lineHeight: "1.5", letterSpacing: "0" }],          // 16px prevents iOS zoom

        // Stats/Numbers (Lora)
        "stat-lg": ["36px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],  // TODO: VERIFY — estimated from text-3xl/4xl usage
        "stat-md": ["30px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "stat-sm": ["24px", { lineHeight: "1.2", letterSpacing: "0" }],
      },

      /* ═══════════════════════════════════════════
         FONT WEIGHTS
         ═══════════════════════════════════════════ */
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },

      /* ═══════════════════════════════════════════
         COLORS — Organized by semantic role
         
         All values reference CSS custom properties 
         defined in tokens.css so light/dark mode works.
         ═══════════════════════════════════════════ */
      colors: {
        /* ── Shadcn/Radix primitive layer ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",                    // DNA Emerald #4A8D77
          foreground: "hsl(var(--primary-foreground))",       // White
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",                  // Warm sand bg
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",                // Warm red #CC3333
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",        // #8A847D warm gray
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",                     // DNA Copper
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",                       // White (light) / #262220 (dark)
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        /* ── BRAND: Core DNA identity ── */
        brand: {
          emerald: {
            DEFAULT: "hsl(var(--dna-emerald))",              // #4A8D77 — signature brand
            light: "hsl(var(--dna-emerald-light))",          // #6BAF98 — hover
            dark: "hsl(var(--dna-emerald-dark))",            // #3A7262 — active/pressed
            subtle: "hsl(var(--dna-emerald-subtle))",        // #E8F2EE — tinted backgrounds
          },
          forest: {
            DEFAULT: "hsl(var(--dna-forest))",               // #2D5A3D — deep green
            light: "hsl(var(--dna-forest-light))",           // #E0EBE4
            dark: "hsl(var(--dna-forest-dark))",             // #1F4029
          },
          copper: {
            DEFAULT: "hsl(var(--dna-copper))",               // #B87333 — warmth/value
            light: "hsl(var(--dna-copper-light))",           // #F2E6D9
            dark: "hsl(var(--dna-copper-dark))",             // #965E29
          },
          gold: {
            DEFAULT: "hsl(var(--dna-gold))",                 // #C4942A — gatherings/DIA
            light: "hsl(var(--dna-gold-light))",             // #F5EDD8
            dark: "hsl(var(--dna-gold-dark))",
          },
        },

        /* ── SURFACE: Page, card, and overlay backgrounds ── */
        surface: {
          page: "hsl(var(--dna-cream))",                     // #F9F7F4 warm cream
          card: "hsl(var(--card))",                           // White (light)
          overlay: "hsl(var(--popover))",                     // Same as card
          muted: "hsl(var(--dna-sand))",                     // #F0EFED secondary bg
          "muted-dark": "hsl(var(--dna-sand-dark))",         // #E2E0DC
        },

        /* ── TEXT: Foreground hierarchy ── */
        text: {
          primary: "hsl(var(--dna-gray800))",                // #3D3833 — headings, main body
          secondary: "hsl(var(--dna-gray600))",              // #666666 — secondary body
          muted: "hsl(var(--dna-gray500))",                  // #8A847D — captions, timestamps
          disabled: "hsl(var(--dna-gray400))",               // #A09A93 — placeholders
          inverse: "hsl(var(--primary-foreground))",         // White — text on colored bgs
        },

        /* ── BORDER: Line/divider hierarchy ── */
        "border-token": {
          DEFAULT: "hsl(var(--dna-stone))",                  // #E8E4DF — standard borders
          subtle: "hsl(var(--dna-sand))",                    // #F0EFED — very light dividers
          strong: "hsl(var(--dna-gray400))",                 // #A09A93 — emphasized borders
        },

        /* ── STATE: Semantic feedback colors ── */
        state: {
          success: "hsl(var(--dna-success))",                // Emerald-aligned #4A8D77
          warning: "hsl(var(--dna-warning))",                // Amber Gold #C4942A
          error: "hsl(var(--dna-error))",                    // Warm red #CC3333
          info: "hsl(var(--dna-info))",                      // Deep Teal #2A7A8C
        },

        /* ── MODULE: Five C's color system ── */
        module: {
          connect: {
            DEFAULT: "hsl(var(--module-connect))",           // Emerald #4A8D77
            light: "hsl(var(--module-connect-light))",
            dark: "hsl(var(--module-connect-dark))",
          },
          convene: {
            DEFAULT: "hsl(var(--module-convene))",           // Amber Gold #C4942A
            light: "hsl(var(--module-convene-light))",
            dark: "hsl(var(--module-convene-dark))",
          },
          collaborate: {
            DEFAULT: "hsl(var(--module-collaborate))",       // Forest Green #2D5A3D
            light: "hsl(var(--module-collaborate-light))",
            dark: "hsl(var(--module-collaborate-dark))",
          },
          contribute: {
            DEFAULT: "hsl(var(--module-contribute))",        // Copper #B87333
            light: "hsl(var(--module-contribute-light))",
            dark: "hsl(var(--module-contribute-dark))",
          },
          convey: {
            DEFAULT: "hsl(var(--module-convey))",            // Deep Teal #2A7A8C
            light: "hsl(var(--module-convey-light))",
            dark: "hsl(var(--module-convey-dark))",
          },
        },

        /* ── DIA: Intelligence agent ── */
        dia: {
          DEFAULT: "hsl(var(--dna-dia))",                    // Gold
          light: "hsl(var(--dna-dia-light))",
          glow: "hsl(var(--dna-dia-glow))",
        },

        /* ── NEUTRAL: Warm gray scale ── */
        neutral: {
          cream: "hsl(var(--dna-cream))",                    // #F9F7F4
          sand: "hsl(var(--dna-sand))",                      // #F0EFED
          stone: "hsl(var(--dna-stone))",                    // #E8E4DF
          400: "hsl(var(--dna-gray400))",                    // #A09A93
          500: "hsl(var(--dna-gray500))",                    // #8A847D
          600: "hsl(var(--dna-gray600))",                    // #666666
          800: "hsl(var(--dna-gray800))",                    // #3D3833
          black: "hsl(var(--dna-black))",                    // #1A1A1A
        },

        /* ── FEED CARD BEVEL COLORS ── */
        bevel: {
          post: "hsl(var(--bevel-post))",                    // Neutral slate
          story: "hsl(var(--bevel-story))",                  // Convey Deep Teal
          event: "hsl(var(--bevel-event))",                  // Convene Amber Gold
          space: "hsl(var(--bevel-space))",                  // Collaborate Forest Green
          opportunity: "hsl(var(--bevel-opportunity))",      // Contribute Copper
        },

        /* ── CULTURAL ACCENT COLORS (use sparingly, 5-10% opacity) ── */
        cultural: {
          terra: "hsl(var(--dna-terra))",                    // Terra Cotta — African pottery
          ochre: "hsl(var(--dna-ochre))",                    // Golden earth
          sunset: "hsl(var(--dna-sunset))",                  // Warm orange
          mint: "hsl(var(--dna-mint))",                      // Soft green
          crimson: {
            DEFAULT: "hsl(var(--dna-crimson))",              // Warm red
            light: "hsl(var(--dna-crimson-light))",          // Error backgrounds
            dark: "hsl(var(--dna-crimson-dark))",
          },
          earth: "hsl(var(--dna-earth))",                    // Brown earth
          ocean: "hsl(var(--dna-ocean))",                    // Deep teal (alias)
        },
      },

      /* ═══════════════════════════════════════════
         SPACING — 4px base grid
         ═══════════════════════════════════════════ */
      spacing: {
        // Tailwind defaults cover 0-96 on 4px grid.
        // These are DNA-specific named tokens:
        "4.5": "18px",   // Between 4 (16px) and 5 (20px) — used in some card padding
        "18": "72px",    // Between 16 (64px) and 20 (80px)
        "22": "88px",    // Custom large spacing
        // Bottom nav height
        "bottom-nav": "4rem", // 64px
      },

      /* ═══════════════════════════════════════════
         BORDER RADIUS
         ═══════════════════════════════════════════ */
      borderRadius: {
        // Shadcn defaults
        lg: "var(--radius)",                                 // 12px
        md: "calc(var(--radius) - 2px)",                     // 10px
        sm: "calc(var(--radius) - 4px)",                     // 8px
        // DNA named tokens
        "dna-sm": "var(--radius-sm, 6px)",                   // Buttons, small elements
        "dna-md": "var(--radius-md, 10px)",                  // Inputs, badges
        "dna-lg": "var(--radius-lg, 12px)",                  // Cards (default)
        "dna-xl": "var(--radius-xl, 16px)",                  // Modals, hero cards
        "dna-full": "var(--radius-full, 9999px)",            // Avatars, pills
      },

      /* ═══════════════════════════════════════════
         BOX SHADOW — 5-level elevation system
         ═══════════════════════════════════════════ */
      boxShadow: {
        // DNA elevation levels (light values; dark overridden in CSS)
        "dna-0": "var(--shadow-level0)",                     // none — flat elements
        "dna-1": "var(--shadow-level1)",                     // Cards at rest
        "dna-2": "var(--shadow-level2)",                     // Cards on hover
        "dna-3": "var(--shadow-level3)",                     // Dropdowns, popovers
        "dna-4": "var(--shadow-level4)",                     // Modals, sheets
        "dna-inner": "var(--shadow-inner)",                  // Inset fields
        "dna-focus": "var(--shadow-focus)",                  // Focus ring glow (emerald)
        "dna-glow": "var(--shadow-glow)",                    // DIA gold glow
      },

      /* ═══════════════════════════════════════════
         KEYFRAMES & ANIMATIONS
         ═══════════════════════════════════════════ */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(100%)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "breathing-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.01)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        "slide-up": "slide-up 250ms ease-out forwards",
        "slide-down": "slide-down 200ms ease-in forwards",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        "breathing-pulse": "breathing-pulse 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

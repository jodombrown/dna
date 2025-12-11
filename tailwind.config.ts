
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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				serif: ['Lora', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// DNA Brand Identity Colors (Updated with Cultural Palette)
				dna: {
					// Core Brand Colors (Primary - Green family for continuity)
					forest: {
						DEFAULT: 'hsl(var(--dna-forest))',
						light: 'hsl(var(--dna-forest-light))',
						dark: 'hsl(var(--dna-forest-dark))'
					},
					emerald: {
						DEFAULT: 'hsl(var(--dna-emerald))',
						light: 'hsl(var(--dna-emerald-light))',
						dark: 'hsl(var(--dna-emerald-dark))'
					},
					
					// Cultural Warm Tones (NEW - African Earth & Heritage)
					terra: {
						DEFAULT: 'hsl(var(--dna-terra))',
						light: 'hsl(var(--dna-terra-light))',
						dark: 'hsl(var(--dna-terra-dark))'
					},
					ochre: {
						DEFAULT: 'hsl(var(--dna-ochre))',
						light: 'hsl(var(--dna-ochre-light))',
						dark: 'hsl(var(--dna-ochre-dark))'
					},
					sunset: {
						DEFAULT: 'hsl(var(--dna-sunset))',
						light: 'hsl(var(--dna-sunset-light))',
						dark: 'hsl(var(--dna-sunset-dark))'
					},
					purple: {
						DEFAULT: 'hsl(var(--dna-purple))',
						light: 'hsl(var(--dna-purple-light))',
						dark: 'hsl(var(--dna-purple-dark))'
					},
					
					// Updated Legacy Colors (WCAG AA Compliant)
					copper: {
						DEFAULT: 'hsl(var(--dna-copper))',  // Now WCAG AA compliant
						light: 'hsl(var(--dna-copper-light))',
						dark: 'hsl(var(--dna-copper-dark))'
					},
					gold: {
						DEFAULT: 'hsl(var(--dna-gold))',  // Now WCAG AA compliant
						light: 'hsl(var(--dna-gold-light))',
						dark: 'hsl(var(--dna-gold-dark))'
					},
					mint: {
						DEFAULT: 'hsl(var(--dna-mint))',
						light: 'hsl(var(--dna-mint-light))',
						dark: 'hsl(var(--dna-mint-dark))'
					},
					crimson: {
						DEFAULT: 'hsl(var(--dna-crimson))',
						light: 'hsl(var(--dna-crimson-light))',
						dark: 'hsl(var(--dna-crimson-dark))'
					},
					
					// Extended Palette (Keep for backward compatibility)
					earth: {
						DEFAULT: 'hsl(var(--dna-earth))',
						light: 'hsl(var(--dna-earth-light))',
						dark: 'hsl(var(--dna-earth-dark))'
					},
					sand: {
						DEFAULT: 'hsl(var(--dna-sand))',
						light: 'hsl(var(--dna-sand-light))',
						dark: 'hsl(var(--dna-sand-dark))'
					},
					ocean: {
						DEFAULT: 'hsl(var(--dna-ocean))',
						light: 'hsl(var(--dna-ocean-light))',
						dark: 'hsl(var(--dna-ocean-dark))'
					},
					
					// Warm Neutral Tones (NEW - Replaces generic grays)
					slate: {
						DEFAULT: 'hsl(var(--dna-slate))',
						light: 'hsl(var(--dna-slate-light))',
						dark: 'hsl(var(--dna-slate-dark))'
					},
					pearl: {
						DEFAULT: 'hsl(var(--dna-pearl))',
						light: 'hsl(var(--dna-pearl-light))',
						dark: 'hsl(var(--dna-pearl-dark))'
					},
					charcoal: {
						DEFAULT: 'hsl(var(--dna-charcoal))',
						light: 'hsl(var(--dna-charcoal-light))',
						dark: 'hsl(var(--dna-charcoal-dark))'
					},
					
					// Semantic Colors
					success: 'hsl(var(--dna-success))',
					warning: 'hsl(var(--dna-warning))',
					error: 'hsl(var(--dna-error))',
					info: 'hsl(var(--dna-info))'
				},
				// North Africa Regional Colors
				'north-africa': {
					sand: 'hsl(var(--north-africa-sand))',
					terracotta: 'hsl(var(--north-africa-terracotta))',
					desert: 'hsl(var(--north-africa-desert))',
					oasis: 'hsl(var(--north-africa-oasis))'
				},
				// Country Flag Colors
				morocco: {
					red: 'hsl(var(--morocco-red))',
					green: 'hsl(var(--morocco-green))'
				},
				egypt: {
					red: 'hsl(var(--egypt-red))',
					white: 'hsl(var(--egypt-white))',
					black: 'hsl(var(--egypt-black))'
				},
				algeria: {
					green: 'hsl(var(--algeria-green))'
				},
				tunisia: {
					red: 'hsl(var(--tunisia-red))'
				},
				libya: {
					green: 'hsl(var(--libya-green))',
					black: 'hsl(var(--libya-black))'
				},
				sudan: {
					red: 'hsl(var(--sudan-red))',
					white: 'hsl(var(--sudan-white))',
					black: 'hsl(var(--sudan-black))',
					green: 'hsl(var(--sudan-green))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'heartbeat': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.8'
					}
				},
				'breathing-pulse': {
					'0%': {
						transform: 'scale(1)',
					},
					'50%': {
						transform: 'scale(1.02)',
					},
					'100%': {
						transform: 'scale(1)',
					}
				},
				'breathing-pulse-staggered': {
					'0%': {
						transform: 'scale(1)',
						boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
					},
					'50%': {
						transform: 'scale(1.15)',
						boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)'
					},
					'100%': {
					transform: 'scale(1)',
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
				}
			},
				'image-heartbeat': {
					'0%, 100%': {
						transform: 'scale(1)',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
					},
					'50%': {
						transform: 'scale(1.02)',
						boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'heartbeat': 'heartbeat 2s ease-in-out infinite',
				'heartbeat-delayed': 'heartbeat 2s ease-in-out infinite 1s',
				'heartbeat-delayed-2': 'heartbeat 2s ease-in-out infinite 2s',
				'breathing-pulse': 'breathing-pulse 1.5s ease-in-out forwards',
				'breathing-pulse-staggered': 'breathing-pulse-staggered 2s ease-in-out infinite',
				'image-heartbeat': 'image-heartbeat 2.5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

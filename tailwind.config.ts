
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
				// DNA Brand Colors
				dna: {
					white: '#ffffff',
					forest: '#183c2e',
					copper: '#d88d4e',
					emerald: '#459c71',
					mint: '#abddd6',
					crimson: '#cc0000',
					gold: '#e6bc2e'
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
				'breathing-pulse-staggered': 'breathing-pulse-staggered 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

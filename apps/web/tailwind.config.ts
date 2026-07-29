import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", "class"],
  theme: {
  	extend: {
  		colors: {
  			background: '#09090b',
  			surface: '#18181b',
  			'surface-border': '#27272a',
  			accent: {
  				DEFAULT: '#6366f1',
  				hover: '#4f46e5',
  				glow: 'rgba(99, 102, 241, 0.15)'
  			},
  			success: {
  				DEFAULT: '#10b981',
  				glow: 'rgba(16, 185, 129, 0.15)'
  			},
  			danger: {
  				DEFAULT: '#ef4444',
  				glow: 'rgba(239, 68, 68, 0.15)'
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
  			}
  		}
  	}
  },
  plugins: [],
};
export default config;

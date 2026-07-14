/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // No 'class' darkMode — we always use dark styles directly
  theme: {
    extend: {
      colors: {
        // Deep black backgrounds
        obsidian: {
          950: '#000000',
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#222222',
          500: '#2a2a2a',
        },
        // Royal crimson accent palette
        crimson: {
          950: '#2d0000',
          900: '#4a0000',
          800: '#6b0000',
          700: '#8B0000',
          600: '#a50000',
          500: '#c00000',
          400: '#d93025',
          300: '#e57368',
          200: '#f0a9a3',
          100: '#fde8e6',
        },
        // Muted silver for text
        silver: {
          900: '#9ca3af',
          800: '#b0b8c1',
          700: '#c9d1d9',
          600: '#d1d5db',
          500: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cinzel)', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'crimson-glow': 'radial-gradient(ellipse at center, rgba(139,0,0,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-crimson': 'pulse-crimson 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-crimson': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139, 0, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(139, 0, 0, 0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(139,0,0,0.5)' },
          '100%': { textShadow: '0 0 20px rgba(139,0,0,0.9), 0 0 40px rgba(139,0,0,0.4)' },
        },
      },
      boxShadow: {
        'crimson': '0 0 20px rgba(139, 0, 0, 0.3)',
        'crimson-lg': '0 0 40px rgba(139, 0, 0, 0.5)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.8)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.8)',
        'card-hover': '0 8px 40px rgba(139, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};

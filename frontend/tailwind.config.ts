import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: 'hsl(244, 100%, 97%)',
          100: 'hsl(244, 100%, 93%)',
          200: 'hsl(244, 95%, 85%)',
          300: 'hsl(244, 90%, 75%)',
          400: 'hsl(244, 85%, 65%)',
          500: 'hsl(244, 80%, 56%)',
          600: 'hsl(244, 75%, 48%)',
          700: 'hsl(244, 70%, 40%)',
          800: 'hsl(244, 65%, 32%)',
          900: 'hsl(244, 60%, 24%)',
          950: 'hsl(244, 55%, 16%)',
        },
        surface: {
          DEFAULT: 'hsl(224, 20%, 8%)',
          1: 'hsl(224, 18%, 11%)',
          2: 'hsl(224, 16%, 14%)',
          3: 'hsl(224, 14%, 18%)',
          4: 'hsl(224, 12%, 22%)',
        },
        accent: {
          emerald: 'hsl(152, 76%, 52%)',
          amber: 'hsl(40, 96%, 58%)',
          rose: 'hsl(350, 89%, 62%)',
          violet: 'hsl(262, 83%, 68%)',
          cyan: 'hsl(192, 91%, 56%)',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, hsl(244,80%,56%) 0%, hsl(262,83%,68%) 100%)',
        'gradient-surface': 'linear-gradient(180deg, hsl(224,18%,11%) 0%, hsl(224,20%,8%) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'gradient-emerald': 'linear-gradient(135deg, hsl(152,76%,52%) 0%, hsl(172,76%,42%) 100%)',
        'gradient-rose': 'linear-gradient(135deg, hsl(350,89%,62%) 0%, hsl(330,80%,55%) 100%)',
        'gradient-amber': 'linear-gradient(135deg, hsl(40,96%,58%) 0%, hsl(30,96%,52%) 100%)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        glow: '0 0 40px rgba(99, 88, 245, 0.25)',
        'glow-sm': '0 0 20px rgba(99, 88, 245, 0.15)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 88, 245, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 88, 245, 0.5)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

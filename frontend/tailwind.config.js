/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-cyan': '#06b6d4',
        'tech-blue': '#3b82f6',
        'tech-pink': '#ec4899',
        'tech-orange': '#f97316',
        'tech-bg': '#f8fafc',
        'tech-text': '#0f172a',
        'tech-muted': '#64748b',
        'tech-border': '#e2e8f0',
        'gold-400': '#fbbf24',
      },
      animation: {
        'slide-up': 'slide-up 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'scale-up': 'scale-up 0.2s ease-out',
      },
      keyframes: {
        'slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
        'scale-up': {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}
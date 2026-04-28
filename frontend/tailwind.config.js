/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#EEF2FF',
          panel: 'rgba(255,255,255,0.65)',
          panelStrong: 'rgba(255,255,255,0.65)',
          border: 'rgba(255,255,255,0.4)',
          green: '#22C55E',
          yellow: '#FACC15',
          red: '#EF4444',
          blue: '#6366F1',
          text: '#1E293B',
          muted: '#64748B',
          subtle: '#94A3B8',
          dark: '#EEF2FF',
        },
      },
      boxShadow: {
        glow: '0 8px 24px rgba(30, 41, 59, 0.08)',
        redGlow: '0 8px 24px rgba(239, 68, 68, 0.12)',
        yellowGlow: '0 8px 24px rgba(250, 204, 21, 0.12)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['Manrope', 'Space Grotesk', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
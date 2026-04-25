/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#F4F1ED',
          panel: '#FAF8F5',
          panelStrong: '#FAF8F5',
          border: 'rgba(193, 182, 167, 0.42)',
          green: '#16A34A',
          yellow: '#CA8A04',
          red: '#DC2626',
          blue: '#4F46E5',
          text: '#2C2C2C',
          muted: '#6B7280',
          subtle: '#9CA3AF',
          dark: '#E5E1DA',
        },
      },
      boxShadow: {
        glow: '0 4px 12px rgba(0, 0, 0, 0.04)',
        redGlow: '0 4px 12px rgba(220, 38, 38, 0.08)',
        yellowGlow: '0 4px 12px rgba(202, 138, 4, 0.08)',
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
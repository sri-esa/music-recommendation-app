/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0B0B0F',
        'cyber-dark': '#151519',
        'dark': {
          DEFAULT: '#0a0a0f',
          100: '#13131A',
          200: '#1c1c24',
          300: '#24242f',
          400: '#2d2d3a',
        },
        'neon': {
          cyan: '#00FFF5',
          magenta: '#FF00FF',
          purple: '#BD00FF',
        },
        'glass': 'rgba(16, 16, 20, 0.6)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 255, 245, 0.3)',
        'neon-glow-purple': '0 0 20px rgba(189, 0, 255, 0.3)',
        'neon-glow-magenta': '0 0 20px rgba(255, 0, 255, 0.3)',
      },
    },
  },
  plugins: [],
} 
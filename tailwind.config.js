// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enables dark mode (useful if you ever add light mode later)
  theme: {
    extend: {
      colors: {
        // Custom colors to match your orange-cyan futuristic theme
        orange: {
          400: '#FF8800',
          500: '#FF7700',
          600: '#FF6600',
        },
        cyan: {
          400: '#00FFFF',
          500: '#00DDDD',
          600: '#00CCCC',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 255, 255, 0.5)',
        'glow-orange': '0 0 30px rgba(255, 136, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 255, 0.8)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#071018',
          elevated: '#0D1720',
          card: '#101B24',
          border: '#1D2A36',
          text: '#F4F7FA',
          secondary: '#AAB4C0',
          muted: '#748294',
        },
        light: {
          bg: '#FFFFFF',
          elevated: '#F5F5F7',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#071018',
          secondary: '#4B5563',
          muted: '#7C8794',
        },
        accent: {
          blue: '#0284C7',
          'blue-dark': '#38BDF8',
          cyan: '#22D3EE',
          'cyan-dark': '#67E8F9',
          gold: '#D4A853',
          green: '#10B981',
          orange: '#F59E0B',
          red: '#EF4444',
        },
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [],
};

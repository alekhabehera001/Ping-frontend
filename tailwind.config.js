/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FF4E8B',
        secondary: '#B24BF3',
        bg: '#0F0F1A',
        surface: '#1A1A2E',
        card: '#16213E',
        text: '#FFFFFF',
        muted: '#8B8B9E',
        accent: '#FF4E8B',
        success: '#4ADE80',
        warning: '#FACC15',
        error: '#F87171',
      },
    },
  },
  plugins: [],
};

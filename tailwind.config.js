/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0B0F12',
          card: '#0F1724',
        },
        accent: {
          purple: '#7C3AED',
          teal: '#06B6D4',
          gold: '#F59E0B',
        },
        text: {
          muted: '#A3A3A3',
          white: '#FFFFFF',
        },
        success: '#10B981',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}


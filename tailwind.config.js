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
    animation: {
      'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'float': 'float 6s ease-in-out infinite',
      'fade-in': 'fadeIn 0.5s ease-in',
    },
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' },
      },
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(-10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },
},
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        spinClockwise: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinCounterClockwise: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        marqueeLoop: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        slideOut: 'slideOut 0.3s ease-in',
        spinClockwiseM: 'spinClockwise 0.3s ease-in-out',
        spinCounterClockwiseM: 'spinCounterClockwise 0.3s ease-in-out',
        spinClockwise: 'spinClockwise 0.5s ease-in-out',
        spinCounterClockwise: 'spinCounterClockwise 0.5s ease-in-out',
        'marquee-loop': 'marqueeLoop 15s linear infinite',
      },
      boxShadow: {
        'inset-indigo': 'inset -4px 4px 8px rgba(0, 0, 0, 0.4)', // 예시
      },
    },
  },
  plugins: [],
}

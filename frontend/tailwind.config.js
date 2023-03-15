/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 15s linear infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'fade-in': 'fade-in 200ms ease-in-out'
      },
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          text: "var(--color-primary-text)",
        },
        'gray-10': '#fcfdff',
        'gray-350': '#b9bdc3',
      },
      boxShadow: {
        'modal': '0 4px 20px 4px rgba(0, 0, 0, 0.1)',
        'centered': 'rgba(99, 99, 99, 0.2) 0 0 10px',
        'centered-sm': 'rgba(99, 99, 99, 0.1) 0 0 4px',
      },
      keyframes: {
        'shimmer': {
          '100%': { '-webkit-mask-position': 'left' }
        },
        'fade-in': {
          '0%': { 'opacity': 0 },
          '100%': { 'opacity': 1 }
        }
      }
    }
  },
  plugins: [],
  prefix: "tw-",
}

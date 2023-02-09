/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-10': '#fcfdff',
        'gray-350': '#b9bdc3',
      },
      boxShadow: {
        'centered': 'rgba(99, 99, 99, 0.2) 0 0 10px',
        'centered-sm': 'rgba(99, 99, 99, 0.1) 0 0 4px',
      }
    }
  },
  plugins: [],
  prefix: "tw-",
}

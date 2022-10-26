/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fabra-green-400': '#508368',
        'fabra-green-500': '#449e6e',
        'fabra-green-600': '#378159',
        'dark-100': '#536680',
        'dark-300': '#3a475a',
        'dark-500': '#2f3a49',
        'dark-900': '#0d1117',
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

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hover': "#E4E4E4",
        'dark-hover': "#b6b6b6",
        'dark-text': '#696969',
        'primary-highlight': '#378159',
        'navigation-highlight': "#d6d6d6",
        'fabra': '#449e6e',
      },
      boxShadow: {
        'centered': 'rgba(99, 99, 99, 0.2) 0 0 10px',
      }
    }
  },
  plugins: [],
  prefix: "tw-",
}

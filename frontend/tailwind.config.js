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
      },
    }
  },
  plugins: [],
  prefix: "tw-",
}

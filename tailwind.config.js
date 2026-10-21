/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef4ff', 100: '#dbe6fe', 500: '#4f6ef7', 600: '#3b55e6', 700: '#2f43c4' },
      },
    },
  },
  plugins: [],
}

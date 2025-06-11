/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode support
  theme: {
    extend: {
      colors:{
        "blue":"#3f51bf",
        "light-white":"#fff"
      }
    },
  },
  plugins: [],
}


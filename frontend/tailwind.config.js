// frontend/tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#dcf2ff',
          200: '#b3e8ff',
          300: '#75d9ff',
          400: '#2cc3ff',
          500: '#06adff',
          600: '#008bdb',
          700: '#0070b0',
          800: '#005d8f',
          900: '#064d76',
          950: '#042e49',
        },
        secondary: {
          50: '#f0faee',
          100: '#dbf5d8',
          200: '#b9eab4',
          300: '#8ad886',
          400: '#5cc159',
          500: '#37a336',
          600: '#278328',
          700: '#206823',
          800: '#1c5120',
          900: '#19441e',
          950: '#07230c',
        },
      },
    },
  },
  plugins: [],
};
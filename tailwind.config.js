/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
        },
        success: {
          DEFAULT: '#28a745',
          600: '#218838',
        },
        danger: {
          DEFAULT: '#dc3545',
          600: '#c82333',
        },
        secondary: {
          DEFAULT: '#6c757d',
          600: '#5a6268',
        },
      },
    },
  },
  plugins: [],
};

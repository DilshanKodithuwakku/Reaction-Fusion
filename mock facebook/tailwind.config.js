/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fb: {
          blue: '#1877F2',
          'blue-hover': '#166fe5',
          gray: {
            bg: '#F0F2F5',
            card: '#FFFFFF',
            hover: '#F2F2F2',
            text: '#65676B',
            darkBg: '#18191A',
            darkCard: '#242526',
            darkHover: '#3A3B3C',
            darkBorder: '#3E4042',
            darkText: '#B0B3B8',
          }
        }
      }
    },
  },
  plugins: [],
}

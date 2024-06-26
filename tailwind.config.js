/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#258752',
          "Medium-Dark": "#1A5F39",
          "Red": '#EE0700',
          "Yellow": '#FFDE7D',
          "Green": '#038674',
        },
        secondary: {
          DEFAULT: '#8A8A8A',
          "Dark": "#151515",
          "Medium-Dark": "#151515",
          "Medium-Light": "#D0D0D0",
          "Light": "#F5F5F5"
        }
      }
    },
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      }
    }
  },
  plugins: [],
}


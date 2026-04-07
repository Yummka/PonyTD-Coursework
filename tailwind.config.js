export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        secondary: '#3c3c58',
        money: '#10b981',
        lives: '#ef4444',
      }
    },
  },
  plugins: [],
}
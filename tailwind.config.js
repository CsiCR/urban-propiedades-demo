/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      colors: {
        karken: {
          yellow: "#FFD51F",
          green: "#215C2E",
          dark: "#0E2431"
        },
        urban: {
          yellow: "#FFD51F",
          green: "#215C2E",
          dark: "#0E2431"
        }
      }
    }
  },
  plugins: []
}

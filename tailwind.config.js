/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        najm: {
          dark: "#0a3d62",
          blue: "#1f72ea",
          light: "#f5f7fa",
          green: "#27ae60",
          red: "#e74c3c",
        },
      },
    },
  },
  plugins: [],
};

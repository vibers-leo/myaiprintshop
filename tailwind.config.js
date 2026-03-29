/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        secondary: "#92400e",
        bg: "#ffffff",
        surface: "#fffbeb",
        text: {
          DEFAULT: "#0f172a",
          muted: "#64748b",
        },
        border: "#e2e8f0",
        success: "#10b981",
        error: "#ef4444",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom palette — "midnight terminal" aesthetic.
        ink: {
          950: "#06080b",
          900: "#0a0d12",
          800: "#10141b",
          700: "#171c25",
          600: "#1f2733",
          500: "#2a3340",
          400: "#3a4554",
        },
        chalk: {
          50: "#f4f5f7",
          100: "#e6e8ec",
          200: "#c8ccd4",
          300: "#9aa1ad",
          400: "#6b7280",
        },
        accent: {
          lime: "#d4ff3a",   // income / positive flow
          amber: "#f5a524",  // expense
          mint:  "#5eead4",  // savings
          rose:  "#fb7185",  // warning
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        hairline: "inset 0 0 0 1px rgba(255,255,255,0.06)",
        glow: "0 0 0 1px rgba(212,255,58,0.25), 0 8px 32px -8px rgba(212,255,58,0.25)",
      },
    },
  },
  plugins: [],
};

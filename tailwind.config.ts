import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        cocoa: {
          950: "#140c08",
          900: "#20130d",
          800: "#2c1810",
          700: "#3d2419",
          600: "#543323",
          100: "#ede6dd",
          50: "#f9f6f0",
        },
        parchment: {
          DEFAULT: "#fcfaf6",
          surface: "#ffffff",
          muted: "#f5efe6",
          border: "#e8dfd3",
          line: "#dfd4c5",
        },
        burgundy: {
          DEFAULT: "#6e2632",
          hover: "#5c1f2a",
          light: "#fdf2f4",
        },
        status: {
          amberBg: "#fffbeb",
          amberText: "#92400e",
          amberBorder: "#fde68a",
          greenBg: "#f0fdf4",
          greenText: "#166534",
          greenBorder: "#bbf7d0",
          redBg: "#fef2f2",
          redText: "#991b1b",
          redBorder: "#fecaca",
          blueBg: "#eff6ff",
          blueText: "#1e40af",
          blueBorder: "#bfdbfe",
          grayBg: "#f3f4f6",
          grayText: "#374151",
          grayBorder: "#e5e7eb",
        },
        brand: {
          espresso: "#170c07",
          chocolate: "#20130d",
          cocoa: "#2b1810",
          dark: "#381e15",
          burgundy: "#6e2632",
          wine: "#904950",
          gold: "#c2a468",
          "gold-light": "#e5c378",
          cream: "#fcf9f4",
          surface: "#f7f2ea",
          sand: "#ece4d6",
          border: "#eadbcc",
          muted: "#615249",
        },
        accent: {
          rose: "#d8677e",
          cyan: "#298c82",
          amber: "#c9822b",
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      maxWidth: {
        "7xl": "1360px",
      },
      boxShadow: {
        subtle: "0 4px 20px -2px rgba(43, 24, 16, 0.04)",
        elevated: "0 12px 32px -4px rgba(43, 24, 16, 0.08), 0 2px 6px 0 rgba(43, 24, 16, 0.03)",
        drawer: "0 16px 40px -8px rgba(29, 18, 13, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;

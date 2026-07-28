import type { Config } from "tailwindcss";

let config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // ── Legacy poster palette — still used by the /trip app UI ──
        ink: {
          DEFAULT: "#0B0D24",
          800: "#0E1029",
          700: "#161A3C",
        },
        cream: {
          DEFAULT: "#F3EAD8",
          muted: "#A7A189",
        },
        gold: {
          DEFAULT: "#C9A84C",
          bright: "#E6CB78",
        },
        flag: "#B22234",

        // ── Warm-light landing palette ──
        sand: {
          DEFAULT: "#FBF6EF", // page background
          100: "#FFFDF9", // lifted surface
          200: "#F3EADA", // subtle block / hover
          300: "#EADFCB", // borders / dividers
        },
        espresso: {
          DEFAULT: "#2E2620", // primary text (warm near-black)
          muted: "#6E635A", // secondary text
        },
        coral: {
          DEFAULT: "#F26B4E", // primary accent / fills
          600: "#DE4F30", // buttons (white text passes)
          700: "#B84327", // accent text on light
          soft: "#FBE7DF", // tinted surface
        },
        teal: {
          DEFAULT: "#1F9E92", // secondary accent
          700: "#0F766E", // teal text on light
          soft: "#E2F1EE",
        },
        sun: "#F4A63C", // warm highlight
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

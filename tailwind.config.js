/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#059669", // Emerald-600
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#1F2937", // Gray-800
          foreground: "#FFFFFF",
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
          DEFAULT: "#374151", // Gray-700
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#FFFFFF", // White
          foreground: "#1F2937", // Gray-800
        },
        sidebar: {
          DEFAULT: "#111827", // Gray-900
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#059669", // Emerald-600
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#D97706", // Amber-600
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#DC2626", // Red-600
          foreground: "#FFFFFF",
        },
        mint: {
          DEFAULT: "#98ffec",
          foreground: "#111827"
        },
        moss1: {
          DEFAULT: "#006270",
          foreground: "#FFFFFF"
        },
        moss2: {
          DEFAULT: "#009394",
          foreground: "#FFFFFF"
        },
        moss3: {
          DEFAULT: "#00E0C7",
          foreground: "#FFFFFF"
        },
        moss4: {
          DEFAULT: "#FFFFFF",
          foreground: "#006270"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 
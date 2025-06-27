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
          DEFAULT: "#1A4C56", // Deep Ocean
          foreground: "#FFFFFF", // Changed from Ivory Sand to white
        },
        secondary: {
          DEFAULT: "#18607F", // Tidal Blue
          foreground: "#FFFFFF", // Changed from Ivory Sand to white
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#9CB7C7", // Sky Mist
          foreground: "#1F2D33", // Midnight
        },
        accent: {
          DEFAULT: "#D4C4A8", // Changed from blue fantastic to oatmeal grayish
          foreground: "#1F2D33", // Midnight
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#FFFFFF", // Changed from Ivory Sand to white
          foreground: "#1A4C56", // Deep Ocean
        },
        sidebar: {
          DEFAULT: "#1F2D33", // Midnight
          foreground: "#FFFFFF", // Changed from Ivory Sand to white
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
        // Custom palette for manual use
        deepOcean: "#1A4C56",
        tidalBlue: "#18607F",
        ivorySand: "#FFFFFF",
        goldanDune: "#D4C4A8",
        skyMist: "#9CB7C7",
        midnight: "#1F2D33",
        blueAsh: "#5A7381",
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
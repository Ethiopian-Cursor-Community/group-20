/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Material Design 3 canonical typeface
        sans: ["Roboto", "system-ui", "sans-serif"],
        display: ["Roboto", "system-ui", "sans-serif"],
      },
      colors: {
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
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        navy: {
          DEFAULT: "hsl(var(--navy))",
          foreground: "hsl(var(--navy-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // MD3-specific aliases that aren't covered by the shadcn names
        md: {
          tertiary: "hsl(var(--md-tertiary))",
          "surface-container": "hsl(var(--md-surface-container))",
          "surface-container-low": "hsl(var(--md-surface-container-low))",
          "on-surface-variant": "hsl(var(--md-on-surface-variant))",
          outline: "hsl(var(--md-outline))",
        },
      },
      borderRadius: {
        // MD3 shape scale
        sm: "0.5rem", // 8px — extra small
        md: "0.75rem", // 12px — small
        lg: "var(--radius)", // 16px — medium (default)
        xl: "1.5rem", // 24px — large (default card)
        "2xl": "1.75rem", // 28px — extra large (dialogs)
        "3xl": "2rem", // 32px — xxl
        "4xl": "3rem", // 48px — hero containers
      },
      boxShadow: {
        // MD3 elevation — soft, diffuse, never harsh
        "md-1": "0 1px 2px hsl(0 0% 0% / 0.05), 0 1px 3px hsl(0 0% 0% / 0.06)",
        "md-2": "0 2px 4px hsl(0 0% 0% / 0.06), 0 4px 12px hsl(0 0% 0% / 0.08)",
        "md-3": "0 4px 8px hsl(0 0% 0% / 0.08), 0 12px 24px hsl(0 0% 0% / 0.1)",
        card: "0 1px 2px hsl(258 33% 20% / 0.05), 0 4px 12px hsl(258 33% 20% / 0.06)",
      },
      transitionTimingFunction: {
        // MD3 "Emphasized Decelerate"
        md: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

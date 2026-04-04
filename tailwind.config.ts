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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        cream: "hsl(var(--cream))",
        rose: "hsl(var(--rose))",
        plum: "hsl(var(--plum))",
        mauve: "hsl(var(--mauve))",
        charcoal: "hsl(var(--charcoal))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
        "3xl": "calc(var(--radius) + 18px)",
      },
      boxShadow: {
        soft: "0 1px 0 hsl(var(--shadow-hsl) / 0.05), 0 14px 42px -18px hsl(var(--shadow-hsl) / 0.09)",
        lift: "0 1px 0 hsl(var(--shadow-hsl) / 0.06), 0 20px 50px -22px hsl(var(--shadow-hsl) / 0.11)",
        inner: "inset 0 1px 0 hsl(var(--shadow-hsl) / 0.04)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial-soft":
          "radial-gradient(ellipse 120% 80% at 50% -24%, hsl(var(--rose) / 0.22), transparent 58%)",
        "gradient-mesh":
          "linear-gradient(132deg, hsl(var(--cream)) 0%, hsl(var(--rose) / 0.08) 48%, hsl(var(--plum) / 0.05) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

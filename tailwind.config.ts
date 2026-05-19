import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/components/**/*.{ts,tsx,js,jsx,mdx}",
    "./src/lib/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-void": "var(--bg-void)",
        "bg-deep": "var(--bg-deep)",
        "bg-mid": "var(--bg-mid)",
        "bg-soft": "var(--bg-soft)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        "ink-mute": "var(--ink-mute)",
        amber: "var(--amber)",
        "amber-warm": "var(--amber-warm)",
        "amber-glow": "var(--amber-glow)",
        teal: "var(--teal)",
        "teal-bright": "var(--teal-bright)",
        purple: "var(--purple)",
        "purple-bright": "var(--purple-bright)",
        rose: "var(--rose)",
        "rose-soft": "var(--rose-soft)",
        "wood-dark": "var(--wood-dark)",
        "wood-mid": "var(--wood-mid)",
        "wood-light": "var(--wood-light)",
        "wood-glow": "var(--wood-glow)",
        "leaf-dark": "var(--leaf-dark)",
        "leaf-mid": "var(--leaf-mid)",
        "leaf-light": "var(--leaf-light)",
        "grass-dark": "var(--grass-dark)",
        "grass-mid": "var(--grass-mid)",
        "grass-light": "var(--grass-light)",
        stone: "var(--stone)",
        "stone-light": "var(--stone-light)",
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        title: ["var(--font-title)"],
        ui: ["var(--font-ui)"],
        body: ["var(--font-body)"],
        code: ["var(--font-code)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;

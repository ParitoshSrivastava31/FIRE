import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-hover": "var(--card-hover)",
        border: "var(--border)",
        "border-light": "var(--border-light)",
        gold: "var(--gold)",
        "gold-dim": "var(--gold-dim)",
        "gold-glow": "var(--gold-glow)",
        emerald: "var(--emerald)",
        "emerald-dim": "var(--emerald-dim)",
        blue: "var(--blue)",
        "blue-dim": "var(--blue-dim)",
        red: "var(--red)",
        "text-main": "var(--text-main)",
        "text-sec": "var(--text-sec)",
        "text-muted": "var(--text-muted)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "sans-serif"],
        serif: ["var(--font-dm-serif)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "noise-pattern": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(30px, 20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s ease both",
        drift: "drift 12s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        pulseGlow: "pulseGlow 2s ease infinite",
      },
      borderRadius: {
        xl: "16px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
export default config;

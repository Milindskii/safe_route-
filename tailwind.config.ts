import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#0D1B2A",
          light: "#FAF8F5",
        },
        surface: {
          dark: "#1A2A3A",
          light: "rgba(255,255,255,0.7)",
        },
        accent: "#F5A623",
        safe: "#4CAF84",
        text: {
          dark: "#E8EDF2",
          light: "#0D1B2A",
          muted: "#8A9BB0",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        syne: ["var(--font-syne)", "sans-serif"],
        lora: ["var(--font-lora)", "serif"],
        jetbrains: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        'noise': "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

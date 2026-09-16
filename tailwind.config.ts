import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "#f3f4f7",
        sidebar: {
          DEFAULT: "#17181c",
          active: "#25262c",
          hover: "#1e1f24",
          border: "#25262c",
          muted: "#848896",
        },
        brand: {
          DEFAULT: "#059669",
          hover: "#047857",
          light: "#ecfdf5",
          orange: "#f97316",
          orangeHover: "#ea580c",
        },
        neon: "#22c55e",
      },
      fontFamily: {
        surat: ['"Times New Roman"', "Times", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        displayClock: ['"Bebas Neue"', '"Oswald"', "Impact", "sans-serif"],
      },
      screens: {
        print: { raw: "print" },
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
export default config;

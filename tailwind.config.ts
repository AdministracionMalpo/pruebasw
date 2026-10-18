import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  // El diseño del portal usa sus propias variables CSS (globals.css); Tailwind y NextUI se suman sin reemplazarlo.
  corePlugins: { preflight: false },
  // ".ring" es el anillo de jornada del portal; evita que Tailwind le agregue su utilidad del mismo nombre.
  blocklist: ["ring"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: { malpo: { DEFAULT: "#931022", 600: "#7a0d1c", 50: "#fbeef0" } },
    },
  },
  plugins: [
    nextui({
      themes: {
        light: { colors: { primary: { DEFAULT: "#931022", foreground: "#ffffff" }, danger: { DEFAULT: "#931022", foreground: "#ffffff" } } },
        dark: { colors: { primary: { DEFAULT: "#e0566a", foreground: "#1a0b0e" }, danger: { DEFAULT: "#e0566a", foreground: "#1a0b0e" } } },
      },
    }),
  ],
};
export default config;

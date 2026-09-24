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
        tecsup: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#0284c7",
          600: "#0369a1",
          700: "#003b71",
          800: "#002855",
          900: "#001b3a",
        },
      },
    },
  },
  plugins: [],
};

export default config;

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
        // Your custom global Jumia colors!
        jumia: {
          DEFAULT: '#f68b1e', 
          dark: '#e07a18',    
          light: '#fdf3e9',   
        }
      },
    },
  },
  plugins: [],
};

export default config;
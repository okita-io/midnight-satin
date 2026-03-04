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
        primary: "#D4AF37",
        gold: "#D4AF37",
        void: "#050505",
        surface: "#121212",
        "surface-highlight": "#1A1A1A",
        "text-main": "#EAEAEA",
        "text-muted": "#8A8A8A",
        accent: "#800020",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        header: ["var(--font-header)", "serif"],
        body: ["var(--font-body)", "serif"],
        ui: ["var(--font-ui)", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        sm: "2px",
        lg: "4px",
      },
      boxShadow: {
        "gold-glow": "0px 4px 20px rgba(212, 175, 55, 0.15)",
        "gold-glow-intense": "0px 0px 30px rgba(212, 175, 55, 0.3)",
        "card-depth": "0 10px 30px -10px rgba(0, 0, 0, 0.8)",
      },
      backgroundImage: {
        "silk-noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
        "gold-sheen":
          "linear-gradient(45deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0) 100%)",
        "gradient-veil":
          "linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0.8) 40%, rgba(5,5,5,1) 100%)",
      },
      padding: {
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-left": "env(safe-area-inset-left, 0px)",
        "safe-right": "env(safe-area-inset-right, 0px)",
      },
    },
  },
  plugins: [],
};

export default config;

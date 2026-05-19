import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        barkas: {
          navy: "#0B2545",
          blue: "#1D6FD8",
          teal: "#0D9373",
          bg: "#EEF2F8"
        }
      },
      fontFamily: {
        sans: ["var(--font)", "Plus Jakarta Sans", "Segoe UI", "sans-serif"],
        head: ["var(--head)", "Syne", "Plus Jakarta Sans", "sans-serif"]
      },
      boxShadow: {
        soft: "0 1px 3px rgba(11,37,69,.06),0 4px 12px rgba(11,37,69,.04)",
        lift: "0 4px 20px rgba(11,37,69,.10)",
        drawer: "0 20px 60px rgba(11,37,69,.18)"
      }
    }
  },
  plugins: []
};

export default config;

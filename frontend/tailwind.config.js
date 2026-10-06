/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#F1F5F9",
          soft: "#94A3B8",
          muted: "#64748B",
        },
        surface: {
          DEFAULT: "#060C18",
          card: "rgba(255,255,255,0.05)",
          elevated: "#0D1526",
        },
        primary: "hsl(210, 70%, 55%)",
        accent: "hsl(165, 80%, 55%)",
        glow: "hsl(180, 100%, 70%)",
        card: "hsla(210, 15%, 22%, 0.6)",
        teal: {
          950: "#042F2E",
          900: "#134E4A",
          800: "#115E59",
          700: "#0F766E",
          600: "#0D9488",
          500: "#14B8A6",
          400: "#2DD4BF",
          300: "#5EEAD4",
        },
        coral: {
          700: "#C2410C",
          600: "#EA580C",
          500: "#F97316",
          400: "#FB923C",
          100: "rgba(249,115,22,0.12)",
        },
        violet: {
          500: "#8B5CF6",
          400: "#A78BFA",
          100: "rgba(139,92,246,0.12)",
        },
        amber: {
          500: "#F59E0B",
          400: "#FCD34D",
          100: "rgba(245,158,11,0.12)",
        },
        emerald: {
          500: "#10B981",
          400: "#34D399",
          100: "rgba(16,185,129,0.12)",
        },
        sand: {
          100: "rgba(255,255,255,0.06)",
        },
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
        tamil: ["'Noto Sans Tamil'", "'Inter'", "sans-serif"],
      },
      boxShadow: {
        floaty: "0 20px 45px -15px rgba(20,184,166,0.3)",
        card: "0 4px 24px 0 rgba(0,0,0,0.5)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        glow: "0 0 40px rgba(20,184,166,0.35)",
        "glow-coral": "0 0 40px rgba(249,115,22,0.3)",
        "glow-sm": "0 0 20px rgba(20,184,166,0.25)",
        "glow-sm-coral": "0 0 20px rgba(249,115,22,0.2)",
      },
      backgroundImage: {
        "teal-radial": "radial-gradient(circle at 30% 20%, #0D9488 0%, #134E4A 55%, #042F2E 100%)",
        "coral-glow": "radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0) 70%)",
        "hero-gradient": "radial-gradient(ellipse at 60% 0%, rgba(20,184,166,0.12) 0%, transparent 60%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(2deg)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientMove: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatSlow: "float 9s ease-in-out infinite",
        pulseRing: "pulseRing 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        rise: "rise 0.6s ease-out both",
        fadeUp: "fadeUp 0.7s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        gradientMove: "gradientMove 5s ease infinite",
      },
    },
  },
  plugins: [],
};

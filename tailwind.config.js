/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* ── Override Tailwind's default cool neutrals with the web's warm
         * neutral scale, so every existing `bg-slate-900`, `text-gray-500`,
         * `border-slate-100 dark:border-slate-800`-style className already
         * used across the app resolves to the new palette without having to
         * touch each call-site. Values are chosen to match the perceptual
         * steps of Tailwind's own gray scale but shifted warm, anchored to
         * the web's on-surface/outline/surface-container tokens. ── */
        gray: {
          50: "#FFF8F6",
          100: "#FFF1EC",
          200: "#FFE3D8",
          300: "#EDD6CD",
          400: "#C9A996",
          500: "#A9917F",
          600: "#8D7165",
          700: "#6B5546",
          800: "#3C2D27",
          900: "#261913",
          950: "#1A100C",
        },
        slate: {
          50: "#FFF8F6",
          100: "#FFF1EC",
          200: "#FFE3D8",
          300: "#EDD6CD",
          400: "#C9A996",
          500: "#A9917F",
          600: "#8D7165",
          700: "#6B5546",
          800: "#3C2D27",
          900: "#261913",
          950: "#1A100C",
        },
        zinc: {
          50: "#FFF8F6",
          100: "#FFF1EC",
          200: "#FFE3D8",
          300: "#EDD6CD",
          400: "#C9A996",
          500: "#A9917F",
          600: "#8D7165",
          700: "#6B5546",
          800: "#3C2D27",
          900: "#261913",
          950: "#1A100C",
        },
        neutral: {
          50: "#FFF8F6",
          100: "#FFF1EC",
          200: "#FFE3D8",
          300: "#EDD6CD",
          400: "#C9A996",
          500: "#A9917F",
          600: "#8D7165",
          700: "#6B5546",
          800: "#3C2D27",
          900: "#261913",
          950: "#1A100C",
        },
        stone: {
          50: "#FFF8F6",
          100: "#FFF1EC",
          200: "#FFE3D8",
          300: "#EDD6CD",
          400: "#C9A996",
          500: "#A9917F",
          600: "#8D7165",
          700: "#6B5546",
          800: "#3C2D27",
          900: "#261913",
          950: "#1A100C",
        },
        /* ── Refreshed web design system (light values; dark via `dark:` or useDarkMode().theme) ── */
        surface: {
          DEFAULT: "#FFF8F6",
          dim: "#EED5CB",
          lowest: "#FFFFFF",
          low: "#FFF1EC",
          container: "#FFE9E1",
          high: "#FDE3D9",
          highest: "#F7DDD3",
          variant: "#F7DDD3",
          // dark counterparts
          "dark": "#0B0E14",
          "dark-low": "#1A1F29",
          "dark-container": "#1E242F",
          "dark-high": "#2D3748",
        },
        "on-surface": {
          DEFAULT: "#261913",
          variant: "#594137",
          dark: "#FFFFFF",
          "dark-variant": "#A0AEC0",
        },
        outline: {
          DEFAULT: "#8D7165",
          variant: "#E1BFB2",
          hairline: "#EDD6CD",
          dark: "#2D3748",
        },
        primary: {
          DEFAULT: "#A23F00",
          container: "#FF7020",
          fixed: "#FFDBCC",
          "fixed-dim": "#FFB595",
          on: "#FFFFFF",
          dark: "#ED8936",
        },
        error: {
          DEFAULT: "#BA1A1A",
          container: "#FFDAD6",
        },
        tertiary: {
          DEFAULT: "#006590",
          container: "#00A5E9",
        },

        /* ── Marketing / auth orange (web #F97316 → #EA580C) ── */
        brand: {
          DEFAULT: "#F97316",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        saffron: {
          DEFAULT: "#FF9933",
          dark: "#E67E22",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          soft: "#F3ECE3",
        },
        brown: {
          600: "#6D4C41",
          800: "#4E342E",
          900: "#3E2723",
        },
        ink: {
          DEFAULT: "#3A2A1F",
          light: "#6B5A4A",
          muted: "#9A8B7A",
        },
        dark: {
          DEFAULT: "#0b0e14",
          card: "#1E242F",
        },

        /* Legacy "profile" tokens – re-pointed at the warm palette */
        profile: {
          primary: "#FFF8F6",
          "primary-dark": "#0B0E14",
          card: "#FFFFFF",
          "card-dark": "#1E242F",
          secondary: "#FFF1EC",
          "secondary-dark": "#1A1F29",
          "text-primary": "#261913",
          "text-primary-dark": "#FFFFFF",
          "text-secondary": "#594137",
          "text-secondary-dark": "#A0AEC0",
          border: "#EDD6CD",
          "border-dark": "#2D3748",
          indicator: "#A23F00",
          "indicator-dark": "#ED8936",
        },
      },
      borderRadius: {
        "token-sm": "4px",
        token: "8px",
        "token-md": "12px",
        "token-lg": "16px",
        "token-xl": "24px",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #FF9933, #FF6B35)",
      },
      fontFamily: {
        /* Body – Plus Jakarta Sans */
        body: ["PlusJakartaSans_400Regular"],
        "body-medium": ["PlusJakartaSans_500Medium"],
        "body-semibold": ["PlusJakartaSans_600SemiBold"],
        "body-bold": ["PlusJakartaSans_700Bold"],
        "body-extrabold": ["PlusJakartaSans_800ExtraBold"],
        /* Display – Playfair Display */
        display: ["PlayfairDisplay_400Regular"],
        "display-medium": ["PlayfairDisplay_500Medium"],
        "display-semibold": ["PlayfairDisplay_600SemiBold"],
        "display-bold": ["PlayfairDisplay_700Bold"],
        "display-extrabold": ["PlayfairDisplay_800ExtraBold"],

        /* Legacy aliases → new families */
        inter: ["PlusJakartaSans_400Regular"],
        "inter-medium": ["PlusJakartaSans_500Medium"],
        "inter-semibold": ["PlusJakartaSans_600SemiBold"],
        "inter-bold": ["PlusJakartaSans_700Bold"],
        "inter-extrabold": ["PlusJakartaSans_800ExtraBold"],
        playfair: ["PlayfairDisplay_400Regular"],
        "playfair-semibold": ["PlayfairDisplay_600SemiBold"],
        "playfair-bold": ["PlayfairDisplay_700Bold"],
        "playfair-extrabold": ["PlayfairDisplay_800ExtraBold"],
      },
    },
  },
  plugins: [],
};

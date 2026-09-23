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
        brand: {
          DEFAULT: "#ea580c",
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
        brown: {
          800: "#4a2f24",
          900: "#2F1E18",
        },
        dark: {
          DEFAULT: "#0b0e14",
          card: "#1f2937",
        },
        profile: {
          primary: "#FFFFFF",
          "primary-dark": "#0B0E14",
          card: "#EDF2F7",
          "card-dark": "#1E242F",
          secondary: "#F7FAFC",
          "secondary-dark": "#1A1F29",
          "text-primary": "#1A202C",
          "text-primary-dark": "#FFFFFF",
          "text-secondary": "#4A5568",
          "text-secondary-dark": "#A0AEC0",
          border: "#E2E8F0",
          "border-dark": "#2D3748",
          indicator: "#1A202C",
          "indicator-dark": "#60A5FA",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #EA580C, #F97316)",
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
        "inter-extrabold": ["Inter_800ExtraBold"],
        playfair: ["PlayfairDisplay_400Regular"],
        "playfair-semibold": ["PlayfairDisplay_600SemiBold"],
        "playfair-bold": ["PlayfairDisplay_700Bold"],
        "playfair-extrabold": ["PlayfairDisplay_800ExtraBold"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium Light Theme Colors (AutomatePro Style)
        bgLight: "#F8FAFC",    // Slate 50 - Main background
        surface: "#FFFFFF",    // White - Cards/Sidebar
        textMain: "#0F172A",   // Slate 900 - Headings
        textSub: "#64748B",    // Slate 500 - Secondary text
        borderLight: "#E2E8F0", // Slate 200 - Borders
        
        // Brand Colors
        vermilion: {
          50: '#FDF2F1',
          100: '#FCE4E2',
          200: '#FA9A93',
          300: '#F87A70',
          400: '#F65A4E',
          500: '#E34234', // Main Vermilion
          600: '#C93226', // Hover Vermilion
          700: '#A9241C',
          800: '#891812',
          900: '#690F0B',
        },
        primary: "#E34234",    // Vermilion - Main Brand Color
        primaryHover: "#C93226", // Vermilion Hover
        secondary: "#1E293B",  // Slate 800
        accent: "#E34234",     // Vermilion

        // Status Colors (Pills)
        success: "#10B981",    // Emerald 500
        warning: "#F59E0B",    // Amber 500
        error: "#EF4444",      // Red 500
        info: "#3B82F6",       // Blue 500

        // Dark Mode Compatibility (Legacy)
        bgDark: "#0F172A", 
        cardBg: "#1E293B",
        primaryText: "#F8FAFC",
        secondaryText: "#94A3B8",
        themeBG: "#1E293B",
        themeText: "white",
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

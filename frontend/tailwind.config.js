/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme / Accent Slate
        primaryDark: '#1a1a1a',
        primaryGray: '#2d2d2d',
        secondaryGray: '#404040',
        accentGray: '#4a4a4a',
        
        // Light Theme Surface
        bgLight: '#f5f5f5',
        cardLight: '#ffffff',
        surfaceLight: '#fafafa',
        borderLight: '#e0e0e0',

        // Typography Gray-scale
        textPrimary: '#1a1a1a',
        textSecondary: '#4a4a4a',
        textMuted: '#757575',
        textLight: '#bdbdbd',

        // Minimal Status Indicators
        successGreen: '#2e7d32',
        warningOrange: '#f57c00',
        errorRed: '#c62828',
        infoBlue: '#1565c0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        button: '8px',
        card: '12px',
        input: '8px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}

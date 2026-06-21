/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#8B0000',   // primary deep red
          accent:  '#C0392B',   // secondary buttons
        },
        gold: '#D4A017',         // KPI highlights, promotions
        bg: '#FFF8F0',            // warm app canvas background
        dark: '#1A1A1A',          // sidebar background
        surface: {
          card:    '#FFFFFF',
          sunken:  '#FBF3E9',     // table alternate rows, warm input background
        },
        success: '#27AE60',
        warning: '#D4A017',
        danger:  '#C0392B',
        info:    '#2563EB',
        text: {
          primary:   '#1C1C1C',
          secondary: '#6B6B6B',
          muted:     '#9E9E9E',
        },
        border: '#E8E8E8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        heading: ['Poppins', 'sans-serif'],
        body:    ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        pill: '50px',
        sheet: '24px',
      },
    },
  },
  plugins: [],
}

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
          DEFAULT: '#8B0000',   // primary deep red — logo, CTAs
          accent:  '#C0392B',   // buttons, active states
        },
        gold: '#D4A017',         // ratings, bestseller badges, offers
        bg: '#FFF8F0',            // app background, warm off-white
        dark: '#1A1A1A',          // dark sections (order tracking header)
        success: '#27AE60',
        text: {
          primary:   '#1C1C1C',
          secondary: '#6B6B6B',
          muted:     '#9E9E9E',
        },
        border: '#E8E8E8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],   // logo, hero headings
        heading: ['Poppins', 'sans-serif'],           // SemiBold/Bold weights
        body:    ['Poppins', 'sans-serif'],           // Regular/Medium weights
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        pill: '50px',
        sheet: '24px',   // bottom sheets, top corners only
      },
    },
  },
  plugins: [],
}

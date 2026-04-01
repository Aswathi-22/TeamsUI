/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        panel:
          '0 24px 80px -28px rgba(15, 23, 42, 0.8), 0 8px 32px -16px rgba(20, 184, 166, 0.35)',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fadeIn: 'fadeIn 450ms ease-out',
      },
    },
  },
  plugins: [],
}

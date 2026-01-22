/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: '#0066cc',
        danger: '#dc2626',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#0ea5e9',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#0f172a',
        secondary: '#64748b',
        muted: '#94a3b8',
        accent: '#2563eb',
        danger: '#ef4444',
        success: '#10b981',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

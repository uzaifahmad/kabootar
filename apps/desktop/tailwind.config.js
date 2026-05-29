/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kabootar: {
          bg: '#0F111A', // Deeper modern dark
          panel: '#1A1D27',
          border: '#2A2F42',
          textMain: '#E2E8F0',
          textMuted: '#94A3B8',
          accent: '#3B82F6',
          accentHover: '#2563EB',
          get: '#10B981',
          post: '#F59E0B',
          put: '#3B82F6',
          delete: '#EF4444',
          patch: '#8B5CF6'
        }
      }
    },
  },
  plugins: [],
}

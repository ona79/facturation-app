/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'mobile': '18px', // Gros texte pour mobile
      },
      spacing: {
        'mobile': '16px', // Espacement adapté mobile
      },
      colors: {
        primary: '#2563eb', // Bleu principal
        primaryDark: '#1e40af',
        success: '#10b981',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}

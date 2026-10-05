/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          vanilla: "#f0ead2",
          tea: "#dde5b6",
          olive: "#adc178",
          copper: "#a98467",
          ash: "#6c584c"
        },
        brand: {
          bg: "#15100d",
          card: "#231c17",
          vanilla: "#f0ead2",
          tea: "#dde5b6",
          olive: "#adc178",
          copper: "#a98467",
          ash: "#6c584c",
          muted: "#dde5b6",
          dark: "#15100d"
        }
      },
      fontFamily: {
        sans: ['BrokenWalken', 'Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['BrokenWalken', 'Plus Jakarta Sans', 'sans-serif'],
        broken: ['BrokenWalken', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass': '0 10px 30px -10px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(108, 88, 76, 0.15)',
        'glass-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(173, 193, 120, 0.2)',
        'olive-glow': '0 15px 35px -5px rgba(173, 193, 120, 0.4)',
        'copper-glow': '0 15px 35px -5px rgba(169, 132, 103, 0.4)',
        'tea-glow': '0 15px 35px -5px rgba(221, 229, 182, 0.3)',
      },
      backgroundImage: {
        'mesh-olive': 'linear-gradient(135deg, #adc178 0%, #8ca156 50%, #6c8038 100%)',
        'mesh-copper': 'linear-gradient(135deg, #a98467 0%, #896449 100%)',
        'mesh-tea': 'linear-gradient(135deg, #dde5b6 0%, #adc178 100%)',
        'mesh-ash': 'linear-gradient(135deg, #6c584c 0%, #4a3b32 100%)',
      }
    },
  },
  plugins: [],
}

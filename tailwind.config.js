/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Electric Blue
          foreground: '#FFFFFF',
          100: '#EFF6FF', // Pale Blue (Active state)
        },
        secondary: {
          DEFAULT: '#1F2937', // Dark Charcoal
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#6B7280', // Medium Gray
          foreground: '#FFFFFF',
        },
        border: {
          subtle: '#F3F4F6',
        },
      },
      borderRadius: {
        'xl': '1rem', // 16px
        '2xl': '1.5rem', // 24px
        '3xl': '2rem', // 32px
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}

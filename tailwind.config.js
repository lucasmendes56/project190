/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#DC2626',
        accent:  '#B91C1C',
        danger:  '#DC2626',
        bg:      '#000000',
        card:    '#0d0d0d',
        surface: '#1a1a1a',
        muted:   '#555555',
        success: '#9e9e9e',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}

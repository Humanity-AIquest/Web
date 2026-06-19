/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07101F',
        'void-2': '#0C1828',
        cosmos: '#131F32',
        bone: '#F2EAD3',
        'bone-dim': '#C9C2AE',
        aurora: '#5BE9DD',
        'aurora-deep': '#2DA89E',
        gold: '#E8B14F',
        bronze: '#A57845',
        terra: '#C97B5B',
        forest: '#1B3B2F',
        'forest-2': '#2A5A47',
        dust: '#6B7593',
      },
      fontFamily: {
        display: ['Fraunces', 'Times New Roman', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'drift': 'drift 14s ease-in-out infinite',
        'fade-up': 'fade-up 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) both',
        'glow-breathe': 'glow-breathe 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(8px, -6px)' },
          '66%': { transform: 'translate(-6px, 4px)' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-breathe': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(91, 233, 221, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(91, 233, 221, 0.85))' },
        },
      },
    },
  },
  plugins: [],
};

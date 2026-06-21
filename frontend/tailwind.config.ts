import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF8F4',
          100: '#F2EDE3',
          200: '#E5DDD0',
          300: '#CFC3AE',
        },
        terracotta: {
          DEFAULT: '#C4603A',
          light: '#F5E8E2',
          dim: '#9B4A2B',
        },
        amber: {
          DEFAULT: '#D4821A',
          light: '#FDF3E0',
          dim: '#9E5F0E',
        },
        moss: {
          DEFAULT: '#4A6741',
          light: '#EBF0E8',
          dim: '#344A2C',
        },
        ink: {
          DEFAULT: '#1E1C18',
          60: 'rgba(30,28,24,0.6)',
          30: 'rgba(30,28,24,0.3)',
          10: 'rgba(30,28,24,0.08)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
    },
  },
  plugins: [],
} satisfies Config

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        cyber: {
          dark: '#0a0a0a',
          darker: '#050505',
          cyan: '#00ffff',
          magenta: '#ff00ff',
          blue: '#0080ff',
          purple: '#8000ff',
          green: '#00ff80',
          neon: '#00ff00',
        },
        resistance: {
          dark: '#0f0f0f',
          darker: '#050505',
          brown: '#8b4513',
          rust: '#cd5c5c',
          amber: '#d4a574',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config



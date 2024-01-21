import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mantine-primary-7': 'var(--mantine-primary-color-7)',
        'mantine-primary': 'var(--mantine-primary-color-filled)',
        'mantine-dark-text': 'var(--mantine-color-dark-text)',
        'mantine-gray-text': 'var(--mantine-color-gray-text)',
        'mantine-text': 'var(--mantine-color-text)',

        'mantine-hover': 'var(--mantine-color-default-hover)',
        'mantine-border': 'var(--mantine-color-default-border)',
        'mantine-background': 'var(--mantine-color-default)',   // for cards, menus
        'mantine-background-body': 'var(--mantine-color-body)',  // for the most-outer body
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      spacing: {
        'navbar-height': '56px',
      }
    },
  },
  plugins: [],
}
export default config

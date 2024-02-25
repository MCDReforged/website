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
        'mantine-dimmed': 'var(--mantine-color-dimmed)',
        'mantine-gray': 'var(--mantine-color-gray-filled)',
        'mantine-dark-text': 'var(--mantine-color-dark-text)',
        'mantine-gray-text': 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-6))',
        'mantine-text': 'var(--mantine-color-text)',
        'mantine-icon-white': 'light-dark(white, var(--mantine-color-text))',

        'mantine-hover': 'var(--mantine-color-default-hover)',
        'mantine-border': 'var(--mantine-color-default-border)',
        'mantine-border-card': 'light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
        'mantine-background': 'var(--mantine-color-default)',   // for cards, menus
        'mantine-background-body': 'var(--mantine-color-body)',  // for the most-outer body

        'attribute-entry-title': 'light-dark(darken(var(--mantine-color-gray-6), 0.2), var(--mantine-color-gray-6))',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      spacing: {
        'navbar-height': '56px',
        'sidebar-width': '20rem',
      }
    },
  },
  darkMode: ['class', '[data-mantine-color-scheme="dark"]'],
  plugins: [],
}
export default config

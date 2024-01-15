const withNextIntl = require('next-intl/plugin')()

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl({
  experimental: {
    // https://mantine.dev/guides/next/#app-router-tree-shaking
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
})

module.exports = nextConfig

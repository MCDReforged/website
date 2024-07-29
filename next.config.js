const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const withNextIntl = require('next-intl/plugin')()

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer(withNextIntl({
  experimental: {
    // https://mantine.dev/guides/next/#app-router-tree-shaking
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  output: process.env.VERCEL ? undefined : 'standalone',
}))

module.exports = nextConfig

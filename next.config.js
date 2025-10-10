import createNextBundleAnalyzer from "@next/bundle-analyzer";
import createNextIntl from "next-intl/plugin";

const withBundleAnalyzer = createNextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
const withNextIntl = createNextIntl()

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

export default nextConfig

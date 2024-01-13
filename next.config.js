const withNextIntl = require('next-intl/plugin')()

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl({
  output: 'export',
})

module.exports = nextConfig

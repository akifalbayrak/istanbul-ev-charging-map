/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
    // Disable specific rules
    rules: {
      'react/no-unescaped-entities': 'off'
    }
  }
}

module.exports = nextConfig 
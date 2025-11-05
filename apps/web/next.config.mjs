/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  transpilePackages: [
    '@ai-front/domain',
    '@ai-front/transport',
    '@ai-front/ui',
    '@ai-front/renderers',
    '@ai-front/plugin-sdk'
  ]
}

export default nextConfig

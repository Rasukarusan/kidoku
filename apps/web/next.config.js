const withPlugins = require('next-compose-plugins')
const path = require('path')

const nextConfig = {
  swcMinify: true, // パフォーマンス改善のため有効化（framer-motion型エラーは修正済み）
  experimental: {
    scrollRestoration: true,
  },
  images: {
    domains: [
      'books.google.com',
      'images-na.ssl-images-amazon.com',
      'm.media-amazon.com',
      'gihyo.jp',
      'image.gihyo.co.jp',
    ],
  },
  // Novelとその依存関係をトランスパイル
  transpilePackages: ['novel', 'katex'],
  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-protected-resource/api/mcp',
        destination: '/api/mcp/oauth/resource',
      },
      {
        source: '/.well-known/oauth-protected-resource',
        destination: '/api/mcp/oauth/resource',
      },
      {
        source: '/.well-known/oauth-authorization-server',
        destination: '/api/mcp/oauth/metadata',
      },
    ]
  },
  webpack(config, options) {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config
  },
}

/**
 * webpack-bundle-analyzer
 */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const nextPlugins = [withBundleAnalyzer]

module.exports = withPlugins(nextPlugins, nextConfig)

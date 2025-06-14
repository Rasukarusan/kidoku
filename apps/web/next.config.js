const withPlugins = require('next-compose-plugins')
const path = require('path')

const nextConfig = {
  swcMinify: true, // SWCを有効にしてビルド高速化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Turbotrace を有効にして依存関係の最適化
    turbotrace: {
      logLevel: 'error',
    },
    // Server Components の最適化
    serverComponentsExternalPackages: ['sharp', '@prisma/client'],
    // 最適化フラグ
    optimizePackageImports: ['@apollo/client', 'recharts', 'react-icons'],
    // Vercel環境でのさらなる最適化
    ...(process.env.VERCEL && {
      outputFileTracingRoot: path.join(__dirname, '../../'),
    }),
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
  // ESM最適化
  transpilePackages: ['@apollo/client', 'graphql'],
  webpack(config, options) {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    
    // self is not definedエラーの修正
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
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

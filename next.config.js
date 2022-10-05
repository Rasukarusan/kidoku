const withPlugins = require('next-compose-plugins')
const path = require('path')

const nextConfig = {
  images: {
    domains: [
      'books.google.com',
      'images-na.ssl-images-amazon.com',
      'm.media-amazon.com',
      'gihyo.jp',
      'image.gihyo.co.jp',
    ],
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

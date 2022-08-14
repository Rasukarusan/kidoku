const path = require('path')

module.exports = {
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
